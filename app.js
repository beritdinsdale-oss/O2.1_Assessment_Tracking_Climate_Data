'use strict';

const ACIS_URL = 'https://data.rcc-acis.org/StnData';

const requestParameters = {
  sid: '351862',
  sdate: '1893',
  edate: String(new Date().getFullYear() - 1),
  meta: ['name', 'state', 'sids'],
  elems: [
    {
      name: 'avgt',
      interval: 'yly',
      duration: 'yly',
      reduce: 'mean',
      maxmissing: 15,
      prec: 1
    }
  ]
};

function calculateTrend(data) {
  const count = data.length;
  const totals = data.reduce(
    (sum, item) => {
      sum.x += item.year;
      sum.y += item.temperature;
      sum.xy += item.year * item.temperature;
      sum.xx += item.year * item.year;
      return sum;
    },
    { x: 0, y: 0, xy: 0, xx: 0 }
  );

  const denominator = count * totals.xx - totals.x * totals.x;

  if (!denominator) {
    return data.map((item) => ({ x: item.year, y: item.temperature }));
  }

  const slope = (count * totals.xy - totals.x * totals.y) / denominator;
  const intercept = (totals.y - slope * totals.x) / count;

  return data.map((item) => ({
    x: item.year,
    y: slope * item.year + intercept
  }));
}

async function loadAcisData() {
  const body = new URLSearchParams({
    params: JSON.stringify(requestParameters)
  });

  const response = await fetch(ACIS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Data service returned ${response.status}.`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.data
    .map(([year, value]) => ({
      year: Number(year),
      temperature: Number(value)
    }))
    .filter(
      (item) =>
        Number.isFinite(item.year) &&
        Number.isFinite(item.temperature)
    );
}

function fillTable(data) {
  const body = document.getElementById('data-table-body');
  const fragment = document.createDocumentFragment();

  data.forEach((item) => {
    const row = document.createElement('tr');
    const year = document.createElement('th');
    const value = document.createElement('td');

    year.scope = 'row';
    year.textContent = String(item.year);
    value.textContent = `${item.temperature.toFixed(1)} °F`;

    row.append(year, value);
    fragment.appendChild(row);
  });

  body.replaceChildren(fragment);
}

function drawChart(data) {
  const canvas = document.getElementById('temperature-chart');

  if (typeof Chart === 'undefined') {
    throw new Error('The chart library did not load.');
  }

  const observations = data.map((item) => ({
    x: item.year,
    y: item.temperature
  }));

  new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Annual average temperature',
          data: observations,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 7,
          tension: 0.1
        },
        {
          label: 'Long-term trend',
          data: calculateTrend(data),
          borderWidth: 4,
          borderDash: [8, 5],
          pointRadius: 0,
          tension: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title(items) {
              return items.length
                ? `Year: ${Math.round(items[0].parsed.x)}`
                : '';
            },
            label(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} °F`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Year'
          },
          ticks: {
            callback(value) {
              return String(Math.round(value));
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Annual average temperature (°F)'
          }
        }
      }
    }
  });
}

function setUpTableButton() {
  const button = document.getElementById('toggle-table');
  const wrapper = document.getElementById('data-table-wrapper');

  button.addEventListener('click', () => {
    const show = wrapper.hidden;
    wrapper.hidden = !show;
    button.setAttribute('aria-expanded', String(show));
    button.textContent = show
      ? 'Hide data table'
      : 'View data as a table';
  });
}

async function initialize() {
  const status = document.getElementById('data-status');
  const chartArea = document.getElementById('chart-area');

  try {
    const data = await loadAcisData();

    if (data.length < 2) {
      throw new Error('Not enough annual observations were returned.');
    }

    fillTable(data);
    drawChart(data);
    setUpTableButton();

    chartArea.hidden = false;
    status.textContent =
      `Loaded ${data.length} annual observations from ${data[0].year} through ${data[data.length - 1].year}.`;
    status.classList.add('success');
  } catch (error) {
    console.error(error);
    status.textContent =
      'The xmACIS data could not be loaded. Refresh the page and check that the site has internet access.';
    status.classList.add('error');
  }
}

document.addEventListener('DOMContentLoaded', initialize);

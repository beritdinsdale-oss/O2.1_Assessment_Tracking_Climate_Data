'use strict';

const temperatureData = [
  { year: 1950, temperature: 52.9 },
  { year: 1955, temperature: 49.6 },
  { year: 1960, temperature: 51.2 },
  { year: 1965, temperature: 52.3 },
  { year: 1970, temperature: 51.9 },
  { year: 1975, temperature: 51.3 },
  { year: 1980, temperature: 52.1 },
  { year: 1985, temperature: 50.4 },
  { year: 1990, temperature: 52.6 },
  { year: 1995, temperature: 54.1 },
  { year: 2000, temperature: 52.1 },
  { year: 2005, temperature: 52.7 },
  { year: 2010, temperature: 52.9 },
  { year: 2015, temperature: 55.2 },
  { year: 2020, temperature: 53.5 },
  { year: 2024, temperature: 53.8 }
];

function calculateTrend(data) {
  const count = data.length;

  const totals = data.reduce(
    (result, item) => {
      result.x += item.year;
      result.y += item.temperature;
      result.xy += item.year * item.temperature;
      result.xx += item.year * item.year;
      return result;
    },
    { x: 0, y: 0, xy: 0, xx: 0 }
  );

  const denominator = count * totals.xx - totals.x * totals.x;

  if (denominator === 0) {
    return data.map((item) => ({ x: item.year, y: item.temperature }));
  }

  const slope = (count * totals.xy - totals.x * totals.y) / denominator;
  const intercept = (totals.y - slope * totals.x) / count;

  return data.map((item) => ({
    x: item.year,
    y: slope * item.year + intercept
  }));
}

function createTemperatureTable(data) {
  const tableBody = document.getElementById('temperature-table-body');

  if (!tableBody) {
    return;
  }

  const fragment = document.createDocumentFragment();

  data.forEach((item) => {
    const row = document.createElement('tr');

    const yearCell = document.createElement('th');
    yearCell.scope = 'row';
    yearCell.textContent = String(item.year);

    const temperatureCell = document.createElement('td');
    temperatureCell.textContent = `${item.temperature.toFixed(1)} °F`;

    row.append(yearCell, temperatureCell);
    fragment.appendChild(row);
  });

  tableBody.replaceChildren(fragment);
}

function initializeTemperatureChart() {
  const canvas = document.getElementById('temperature-chart');

  if (!canvas) {
    return;
  }

  if (typeof Chart === 'undefined') {
    const message = document.createElement('p');
    message.className = 'notice';
    message.textContent =
      'The interactive chart could not load. Use the data table below instead.';
    canvas.replaceWith(message);
    return;
  }

  const annualValues = temperatureData.map((item) => ({
    x: item.year,
    y: item.temperature
  }));

  const trendValues = calculateTrend(temperatureData);

  new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Annual average temperature',
          data: annualValues,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          tension: 0.15
        },
        {
          label: 'Long-term trend',
          data: trendValues,
          borderWidth: 4,
          pointRadius: 0,
          borderDash: [8, 5],
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
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title(items) {
              return items.length ? `Year: ${Math.round(items[0].parsed.x)}` : '';
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
            text: 'Average temperature (°F)'
          }
        }
      }
    }
  });
}

function initializeDataTableToggle() {
  const button = document.getElementById('toggle-data-table');
  const tableContainer = document.getElementById('temperature-data-table');

  if (!button || !tableContainer) {
    return;
  }

  button.addEventListener('click', () => {
    const willShow = tableContainer.hidden;

    tableContainer.hidden = !willShow;
    button.setAttribute('aria-expanded', String(willShow));
    button.textContent = willShow
      ? 'Hide data table'
      : 'View data as a table';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createTemperatureTable(temperatureData);
  initializeTemperatureChart();
  initializeDataTableToggle();
});

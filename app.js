(() => {
  const quiz = document.querySelector("#quiz");
  const progress = document.querySelector("#progress");
  const resetButton = document.querySelector("#reset-quiz");
  const questions = [...document.querySelectorAll(".question")];
  const completed = new Set();

  const feedbackText = {
    q1: {
      correct:
        "Correct. Although annual temperatures rise and fall from year to year, the long-term trend line slopes upward.",
      incorrect:
        "Not quite. Focus on the overall direction of the long-term trend line rather than individual warm or cool years."
    },
    q2: {
      correct:
        "Correct. The points show year-to-year variability, while the trend line summarizes the overall direction across many decades.",
      incorrect:
        "Not quite. Individual years do not all follow the trend line exactly. The line helps reveal the broader pattern across the full record."
    },
    q3: {
      correct:
        "Correct. The graph supports the conclusion that Corvallis has experienced a long-term warming trend, even though some individual years were cooler.",
      incorrect:
        "Not quite. A climate trend does not mean every year is warmer than the one before it. Look at the overall pattern across the full record."
    },
    q4: {
      correct:
        "Correct. A warming trend can affect planting dates, heat stress, irrigation needs, pest activity, and which plants are well suited to a location.",
      incorrect:
        "Not quite. Long-term temperature trends can influence several practical gardening decisions, even though the graph alone cannot predict conditions in a particular future year."
    }
  };

  function updateProgress() {
    if (progress) {
      progress.textContent =
        `${completed.size} of ${questions.length} questions answered correctly.`;
    }
  }

  questions.forEach((question, index) => {
    const button = question.querySelector(".check-answer");
    const feedback = question.querySelector(".feedback");
    const name = `q${index + 1}`;

    button?.addEventListener("click", () => {
      const selected = question.querySelector(
        `input[name="${name}"]:checked`
      );

      if (!feedback) return;

      feedback.className = "feedback";

      if (!selected) {
        feedback.textContent =
          "Please select an answer before checking.";
        feedback.classList.add("incorrect");
        return;
      }

      const isCorrect =
        selected.value === question.dataset.correct;

      if (isCorrect) {
        completed.add(name);
        feedback.textContent = feedbackText[name].correct;
        feedback.classList.add("correct");
      } else {
        completed.delete(name);
        feedback.textContent = feedbackText[name].incorrect;
        feedback.classList.add("incorrect");
      }

      updateProgress();
    });
  });

  resetButton?.addEventListener("click", () => {
    quiz?.reset();
    completed.clear();

    document.querySelectorAll(".feedback").forEach((item) => {
      item.textContent = "";
      item.className = "feedback";
    });

    updateProgress();
    document.querySelector("#questions-heading")?.focus();
  });

  updateProgress();
})();

/*
 * Interactive Corvallis temperature chart
 */

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

  const denominator =
    count * totals.xx - totals.x * totals.x;

  if (denominator === 0) {
    return data.map((item) => ({
      x: item.year,
      y: item.temperature
    }));
  }

  const slope =
    (count * totals.xy - totals.x * totals.y) /
    denominator;

  const intercept =
    (totals.y - slope * totals.x) / count;

  return data.map((item) => ({
    x: item.year,
    y: slope * item.year + intercept
  }));
}

function createTemperatureTable(data) {
  const tableBody = document.getElementById(
    "temperature-table-body"
  );

  if (!tableBody) return;

  tableBody.innerHTML = "";

  data.forEach((item) => {
    const row = document.createElement("tr");

    const yearCell = document.createElement("th");
    yearCell.scope = "row";
    yearCell.textContent = item.year;

    const temperatureCell = document.createElement("td");
    temperatureCell.textContent =
      `${item.temperature.toFixed(1)} °F`;

    row.append(yearCell, temperatureCell);
    tableBody.appendChild(row);
  });
}

function initializeTemperatureChart() {
  const canvas = document.getElementById(
    "temperature-chart"
  );

  if (!canvas || typeof Chart === "undefined") return;

  const annualValues = temperatureData.map((item) => ({
    x: item.year,
    y: item.temperature
  }));

  const trendValues = calculateTrend(temperatureData);

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Annual average temperature",
          data: annualValues,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          tension: 0.15
        },
        {
          label: "Long-term trend",
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
        mode: "nearest",
        intersect: false
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: true,
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            title(items) {
              if (!items.length) return "";
              return `Year: ${items[0].parsed.x}`;
            },
            label(context) {
              return `${context.dataset.label}: ` +
                `${context.parsed.y.toFixed(1)} °F`;
            }
          }
        }
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Year"
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
            text: "Average temperature (°F)"
          }
        }
      }
    }
  });

  const yearlyValuesControl = document.getElementById(
    "show-yearly-values"
  );
  const trendLineControl = document.getElementById(
    "show-trend-line"
  );

  yearlyValuesControl?.addEventListener("change", () => {
    chart.setDatasetVisibility(
      0,
      yearlyValuesControl.checked
    );
    chart.update();
  });

  trendLineControl?.addEventListener("change", () => {
    chart.setDatasetVisibility(
      1,
      trendLineControl.checked
    );
    chart.update();
  });
}

function initializeDataTableToggle() {
  const button = document.getElementById(
    "toggle-data-table"
  );
  const tableContainer = document.getElementById(
    "temperature-data-table"
  );

  if (!button || !tableContainer) return;

  button.addEventListener("click", () => {
    const isCurrentlyHidden = tableContainer.hidden;

    tableContainer.hidden = !isCurrentlyHidden;
    button.setAttribute(
      "aria-expanded",
      String(isCurrentlyHidden)
    );
    button.textContent = isCurrentlyHidden
      ? "Hide data table"
      : "View data as a table";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  createTemperatureTable(temperatureData);
  initializeTemperatureChart();
  initializeDataTableToggle();
});

const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "auth.html";

const API_URL = "http://127.0.0.1:8000/api/expenses/";

const totalExpensesEl = document.getElementById("totalExpenses");
const monthlyAverageEl = document.getElementById("monthlyAverage");
const topCategoryEl = document.getElementById("topCategory");

let categoryChart;
let monthlyChart;

// --- Event Listeners ---

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "auth.html";
});

// --- Load Analytics ---

document.addEventListener("DOMContentLoaded", loadAnalytics);

async function loadAnalytics() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "auth.html";
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Expected array of expenses");
      return;
    }

    computeSummary(data);
    renderCategoryChart(data);
    renderMonthlyChart(data);
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

function computeSummary(expenses) {
  let total = 0;
  const categoryTotals = {};
  const monthlyTotals = {};

  expenses.forEach((e) => {
    const amount = Number(e.amount) || 0;
    total += amount;

    // Use category_name from the expense object (matching dashboard structure)
    const category = e.category_name || "Uncategorized";
    categoryTotals[category] = (categoryTotals[category] || 0) + amount;

    const month = e.date.slice(0, 7);
    monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const monthCount = Object.keys(monthlyTotals).length || 1;

  totalExpensesEl.textContent = `₱${total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })}`;

  monthlyAverageEl.textContent = `₱${(total / monthCount).toLocaleString(
    undefined,
    { minimumFractionDigits: 2 }
  )}`;

  topCategoryEl.textContent = topCategory ? topCategory[0] : "—";
}

function renderCategoryChart(expenses) {
  const totals = {};

  expenses.forEach((e) => {
    const category = e.category_name || "Uncategorized";
    totals[category] = (totals[category] || 0) + Number(e.amount);
  });

  const ctx = document.getElementById("categoryChart");

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: [
            "#2563eb",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
            "#06b6d4",
            "#84cc16",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 12,
            font: {
              size: 12,
              family: "'Inter', sans-serif",
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              return `${label}: ₱${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`;
            },
          },
        },
      },
    },
  });
}

function renderMonthlyChart(expenses) {
  const totals = {};

  expenses.forEach((e) => {
    const month = e.date.slice(0, 7);
    totals[month] = (totals[month] || 0) + Number(e.amount);
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(totals).sort();
  const sortedValues = sortedMonths.map((month) => totals[month]);

  const ctx = document.getElementById("monthlyChart");

  if (monthlyChart) {
    monthlyChart.destroy();
  }

  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sortedMonths,
      datasets: [
        {
          label: "Expenses",
          data: sortedValues,
          backgroundColor: "#2563eb",
          borderColor: "#1d4ed8",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.parsed.y || 0;
              return `Expenses: ₱${value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₱" + value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

loadAnalytics();

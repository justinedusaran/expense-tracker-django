const accessToken = localStorage.getItem("access");

if (!accessToken) {
  window.location.href = "login.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "login.html";
});

// Example: fetch expenses (enable when API is ready)
async function loadExpenses() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/expenses/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    renderExpenses(data);
  } catch (error) {
    console.error(error);
  }
}

function renderExpenses(expenses) {
  const table = document.getElementById("expensesTable");
  table.innerHTML = "";

  if (expenses.length === 0) {
    table.innerHTML = `
            <tr>
                <td colspan="4" class="empty">No expenses yet</td>
            </tr>
        `;
    return;
  }

  expenses.forEach((exp) => {
    table.innerHTML += `
            <tr>
                <td>${exp.date}</td>
                <td>${exp.category_name}</td>
                <td>${exp.description}</td>
                <td>₱${exp.amount}</td>
            </tr>
        `;
  });
}

// Uncomment when backend endpoint is ready
// loadExpenses();

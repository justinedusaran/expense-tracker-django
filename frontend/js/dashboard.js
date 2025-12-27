const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "login.html";

const table = document.getElementById("expensesTable");
const modal = document.getElementById("expenseModal");
const form = document.getElementById("expenseForm");

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Open modal
document.getElementById("addExpenseBtn").onclick = () => {
  form.reset();
  document.getElementById("expenseId").value = "";
  modal.classList.remove("hidden");
};

// Close modal
document.getElementById("cancelBtn").onclick = () => {
  modal.classList.add("hidden");
};

// Load expenses
async function loadExpenses() {
  const res = await fetch("http://127.0.0.1:8000/api/expenses/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  // IMPORTANT
  renderExpenses(data.results ?? []);
}

function renderExpenses(expenses) {
  table.innerHTML = "";

  if (expenses.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="empty">No expenses yet</td></tr>`;
    return;
  }

  expenses.forEach((exp) => {
    table.innerHTML += `
            <tr>
                <td>${exp.date}</td>
                <td>${exp.category_name}</td>
                <td>${exp.description}</td>
                <td>₱${exp.amount}</td>
                <td class="actions">
                    <button class="btn ghost" onclick="editExpense(${exp.id})">Edit</button>
                    <button class="btn ghost" onclick="deleteExpense(${exp.id})">Delete</button>
                </td>
            </tr>
        `;
  });
}

// Delete
async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;

  await fetch(`http://127.0.0.1:8000/api/expenses/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  loadExpenses();
}

// Submit form
form.onsubmit = async (e) => {
  e.preventDefault();

  const id = document.getElementById("expenseId").value;
  const payload = {
    date: date.value,
    category_name: category.value,
    description: description.value,
    amount: amount.value,
  };

  const url = id
    ? `http://127.0.0.1:8000/api/expenses/${id}/`
    : `http://127.0.0.1:8000/api/expenses/`;

  const method = id ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  modal.classList.add("hidden");
  loadExpenses();
};

loadExpenses();

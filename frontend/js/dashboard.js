const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "login.html";

const table = document.getElementById("expensesTable");
const modal = document.getElementById("expenseModal");
const form = document.getElementById("expenseForm");
const categorySelect = document.getElementById("category");

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Open modal
document.getElementById("addExpenseBtn").onclick = () => {
  form.reset();
  document.getElementById("expenseId").value = "";
  loadCategories();
  modal.classList.remove("hidden");
};

// Close modal
document.getElementById("cancelBtn").onclick = () => {
  modal.classList.add("hidden");
};

//Load categories
async function loadCategories() {
  const response = await fetch("http://127.0.0.1:8000/api/categories/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    alert("Failed to load categories");
    return;
  }

  const categories = await response.json();
  categorySelect.innerHTML = `<option value="">Select category</option>`;

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

// Load expenses
async function loadExpenses() {
  const response = await fetch("http://127.0.0.1:8000/api/expenses/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }

  const data = await response.json();
  renderExpenses(data);
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
form.onsubmit = async function (e) {
  e.preventDefault();

  const payload = {
    date: date.value,
    category: parseInt(category.value),
    description: description.value,
    amount: parseFloat(amount.value),
  };

  const response = await fetch("http://127.0.0.1:8000/api/expenses/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    alert("Failed to save expense:\n" + err);
    return;
  }

  modal.classList.add("hidden");
  loadExpenses();
};

loadExpenses();

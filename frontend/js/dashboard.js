const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "login.html";

const table = document.getElementById("expensesTable");
const modal = document.getElementById("expenseModal");
const form = document.getElementById("expenseForm");
const categorySelect = document.getElementById("category");
let editingExpenseId = null;

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// Open modal (Add New)
document.getElementById("addExpenseBtn").onclick = () => {
  editingExpenseId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Add Expense"; // Reset title
  loadCategories();
  modal.classList.remove("hidden");
};

// Close modal
document.getElementById("cancelBtn").onclick = () => {
  modal.classList.add("hidden");
};

// Load categories
async function loadCategories() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/categories/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to load categories:", text);
      alert("Failed to load categories. See console for details.");
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
  } catch (err) {
    console.error("Error loading categories:", err);
    alert("Error loading categories. See console for details.");
  }
}

// Load expenses
async function loadExpenses() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/expenses/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();
      console.error("Failed to parse JSON from /api/expenses/:", text);
      alert("Failed to load expenses. See console for details.");
      return;
    }

    renderExpenses(data);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    alert("Error loading expenses. See console for details.");
  }
}

// Render expenses in table
function renderExpenses(expenses) {
  table.innerHTML = "";
  if (!expenses || expenses.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="empty">No expenses yet</td></tr>`;
    return;
  }

  expenses.forEach((exp) => {
    table.innerHTML += `
      <tr>
        <td>${exp.date}</td>
        <td>${exp.category_name || ""}</td>
        <td>${exp.title || ""}</td>
        <td>${exp.note || ""}</td>
        <td>₱${exp.amount || 0}</td>
        <td class="actions">
          <button class="btn ghost" onclick="editExpense(${
            exp.id
          })">Edit</button>
          <button class="btn ghost" onclick="deleteExpense(${
            exp.id
          })">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Edit expense
async function editExpense(id) {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/expenses/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Could not fetch expense details");

    const exp = await response.json();

    editingExpenseId = id;

    await loadCategories();

    document.getElementById("date").value = exp.date;
    document.getElementById("category").value = exp.category_id;
    document.getElementById("title").value = exp.title;
    document.getElementById("note").value = exp.note;
    document.getElementById("amount").value = exp.amount;

    document.getElementById("modalTitle").textContent = "Edit Expense";
    modal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Error loading expense data.");
  }
}

// Delete expense
async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/expenses/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to delete expense:", text);
      alert("Failed to delete expense. See console for details.");
      return;
    }

    loadExpenses();
  } catch (err) {
    console.error("Error deleting expense:", err);
    alert("Error deleting expense. See console for details.");
  }
}

// Submit form
form.onsubmit = async function (e) {
  e.preventDefault();

  const payload = {
    date: document.getElementById("date").value,
    category_id: category.value ? parseInt(category.value) : null,
    title: document.getElementById("title").value,
    note: document.getElementById("note").value,
    amount: amount.value ? parseFloat(amount.value) : null,
  };

  let url = "http://127.0.0.1:8000/api/expenses/";
  let method = "POST";

  if (editingExpenseId) {
    url += `${editingExpenseId}/`;
    method = "PUT";
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Save failed:", text);
      alert("Failed to save expense.");
      return;
    }

    modal.classList.add("hidden");
    editingExpenseId = null;
    loadExpenses();
  } catch (err) {
    console.error("Error saving expense:", err);
  }
};

// Initial load
loadExpenses();

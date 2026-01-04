const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "index.html";

const table = document.getElementById("expensesTable");
const modal = document.getElementById("expenseModal");
const form = document.getElementById("expenseForm");
const categorySelect = document.getElementById("category");
const filterStart = document.getElementById("filterStartDate");
const filterEnd = document.getElementById("filterEndDate");
const filterCat = document.getElementById("filterCategory");
const deleteModal = document.getElementById("deleteModal");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

let idToDelete = null;
let currentSortField = "-date";
let editingExpenseId = null;
let allExpenses = [];
let currentPage = 1;
const itemsPerPage = 3;

// --- Event Listeners ---

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

document.getElementById("addExpenseBtn").onclick = () => {
  editingExpenseId = null;
  form.reset();
  document.getElementById("modalTitle").textContent = "Add Expense";
  modal.classList.remove("hidden");
};

document.getElementById("cancelBtn").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("applyFiltersBtn").onclick = loadExpenses;

document.getElementById("clearFiltersBtn").onclick = () => {
  filterStart.value = "";
  filterEnd.value = "";
  filterCat.value = "";
  loadExpenses();
};

prevPageBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderCurrentPage();
  }
};

nextPageBtn.onclick = () => {
  const totalPages = Math.ceil(allExpenses.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderCurrentPage();
  }
};

// Handle Sorting Click
document.querySelectorAll("th.sortable").forEach((header) => {
  header.addEventListener("click", () => {
    const field = header.getAttribute("data-sort");

    if (currentSortField === field) {
      currentSortField = `-${field}`;
    } else {
      currentSortField = field;
    }

    updateSortIcons(header, currentSortField);
    loadExpenses();
  });
});

function updateSortIcons(clickedHeader, sortField) {
  document
    .querySelectorAll(".sort-icon")
    .forEach((icon) => (icon.textContent = "↕"));
  const icon = clickedHeader.querySelector(".sort-icon");
  icon.textContent = sortField.startsWith("-") ? "↓" : "↑";
}

// --- Functions ---

async function loadCategories() {
  try {
    const response = await fetch(
      "https://expense-tracker-api-9lnt.onrender.com/api/categories/",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) return;

    const categories = await response.json();

    categorySelect.innerHTML = `<option value="">Select category</option>`;
    filterCat.innerHTML = `<option value="">All Categories</option>`;

    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;

      categorySelect.appendChild(option.cloneNode(true));
      filterCat.appendChild(option.cloneNode(true));
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
}

async function loadExpenses() {
  let url = new URL(
    "https://expense-tracker-api-9lnt.onrender.com/api/expenses/"
  );

  if (filterStart.value)
    url.searchParams.append("start_date", filterStart.value);
  if (filterEnd.value) url.searchParams.append("end_date", filterEnd.value);
  if (filterCat.value) url.searchParams.append("category", filterCat.value);
  url.searchParams.append("ordering", currentSortField);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) window.location.href = "index.html";

    const data = await response.json();
    allExpenses = data;
    currentPage = 1;
    renderCurrentPage();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}

function renderCurrentPage() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageExpenses = allExpenses.slice(startIndex, endIndex);

  renderExpenses(pageExpenses);
  updatePaginationUI();
}

function updatePaginationUI() {
  const totalPages = Math.ceil(allExpenses.length / itemsPerPage) || 1;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage >= totalPages || allExpenses.length === 0;
}

function renderExpenses(expenses) {
  table.innerHTML = "";

  // --- Stats Calculation Variables ---
  let totalAll = 0;
  let totalMonth = 0;
  const count = allExpenses.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  if (!expenses || expenses.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="empty">No expenses found</td></tr>`;
    if (allExpenses.length === 0) {
      updateStats(0, 0, 0);
    }
    return;
  }

  // Calculate stats from ALL expenses, not just current page
  allExpenses.forEach((exp) => {
    const amount = parseFloat(exp.amount) || 0;
    totalAll += amount;

    const expDate = new Date(exp.date);
    if (
      expDate.getMonth() === currentMonth &&
      expDate.getFullYear() === currentYear
    ) {
      totalMonth += amount;
    }
  });

  // Render only current page expenses
  expenses.forEach((exp) => {
    const amount = parseFloat(exp.amount) || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${exp.date}</td>
            <td><span class="category-badge">${
              exp.category_name || "Uncategorized"
            }</span></td>
            <td>${exp.title || ""}</td>
            <td>${exp.note || ""}</td>
            <td class="amount">₱${amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}</td>
            <td class="actions">
                <button class="btn ghost edit-btn">Edit</button>
                <button class="btn ghost delete-btn">Delete</button>
            </td>
        `;

    row.querySelector(".edit-btn").onclick = () => editExpense(exp.id);
    row.querySelector(".delete-btn").onclick = () => deleteExpense(exp.id);
    table.appendChild(row);
  });

  updateStats(totalAll, totalMonth, count);
}

function updateStats(total, month, count) {
  document.getElementById(
    "totalExpenses"
  ).textContent = `₱${total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })}`;
  document.getElementById(
    "monthExpenses"
  ).textContent = `₱${month.toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })}`;
  document.getElementById("totalCount").textContent = count;
}

async function editExpense(id) {
  try {
    const response = await fetch(
      `https://expense-tracker-api-9lnt.onrender.com/api/expenses/${id}/`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Could not fetch details");

    const exp = await response.json();
    editingExpenseId = id;

    document.getElementById("date").value = exp.date;
    document.getElementById("category").value = exp.category_id;
    document.getElementById("title").value = exp.title;
    document.getElementById("note").value = exp.note;
    document.getElementById("amount").value = exp.amount;

    document.getElementById("modalTitle").textContent = "Edit Expense";
    modal.classList.remove("hidden");
  } catch (err) {
    console.error(err);
  }
}

function deleteExpense(id) {
  idToDelete = id;
  deleteModal.classList.remove("hidden");
}

document.getElementById("cancelDeleteBtn").onclick = () => {
  deleteModal.classList.add("hidden");
  idToDelete = null;
};

document.getElementById("confirmDeleteBtn").onclick = async () => {
  if (!idToDelete) return;
  try {
    const response = await fetch(
      `https://expense-tracker-api-9lnt.onrender.com/api/expenses/${idToDelete}/`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.ok) {
      deleteModal.classList.add("hidden");
      idToDelete = null;
      loadExpenses();
    }
  } catch (err) {
    console.error("Error deleting:", err);
  }
};

form.onsubmit = async function (e) {
  e.preventDefault();

  const payload = {
    date: document.getElementById("date").value,
    category_id: categorySelect.value ? parseInt(categorySelect.value) : null,
    title: document.getElementById("title").value,
    note: document.getElementById("note").value,
    amount: document.getElementById("amount").value
      ? parseFloat(document.getElementById("amount").value)
      : null,
  };

  let url = "https://expense-tracker-api-9lnt.onrender.com/api/expenses/";
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

    if (response.ok) {
      modal.classList.add("hidden");
      editingExpenseId = null;
      loadExpenses();
    }
  } catch (err) {
    console.error("Error saving:", err);
  }
};

loadCategories();
loadExpenses();

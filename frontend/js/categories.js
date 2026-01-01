const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "login.html";

const table = document.getElementById("categoriesTable");
const modal = document.getElementById("categoryModal");
const categoryNameInput = document.getElementById("categoryName");
const modalTitle = document.getElementById("modalTitle");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

let editingCategoryId = null;
let allCategories = [];
let currentPage = 1;
const itemsPerPage = 4;

// --- Event Listeners ---

// Logout
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "login.html";
};

// Open modal for adding category
document.getElementById("openModalBtn").onclick = () => {
  editingCategoryId = null;
  categoryNameInput.value = "";
  modalTitle.textContent = "Add Category";
  modal.classList.remove("hidden");
};

// Close modal
document.getElementById("cancelBtn").onclick = () => {
  modal.classList.add("hidden");
};

// Pagination controls
prevPageBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderCurrentPage();
  }
};

nextPageBtn.onclick = () => {
  const totalPages = Math.ceil(allCategories.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderCurrentPage();
  }
};

// --- Functions ---

// Load categories
async function loadCategories() {
  const response = await fetch("http://127.0.0.1:8000/api/categories/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }

  const categories = await response.json();
  allCategories = categories;
  currentPage = 1;
  renderCurrentPage();
}

function renderCurrentPage() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageCategories = allCategories.slice(startIndex, endIndex);

  renderCategories(pageCategories);
  updatePaginationUI();
}

function updatePaginationUI() {
  const totalPages = Math.ceil(allCategories.length / itemsPerPage) || 1;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled =
    currentPage >= totalPages || allCategories.length === 0;
}

function renderCategories(categories) {
  const categoryTable = document.getElementById("categoriesTable");
  const totalCategoriesEl = document.getElementById("totalCategories");

  if (!categoryTable) return;

  categoryTable.innerHTML = "";

  // Update the stat card count with ALL categories
  if (totalCategoriesEl) {
    totalCategoriesEl.textContent = allCategories.length;
  }

  if (categories.length === 0) {
    categoryTable.innerHTML = `<tr><td colspan="2" class="empty">No categories yet</td></tr>`;
    if (allCategories.length === 0) {
      if (totalCategoriesEl) totalCategoriesEl.textContent = "0";
    }
    return;
  }

  categories.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${cat.name}</td>
      <td class="actions" style="text-align: right;">
        <button class="btn ghost edit-btn">Edit</button>
        <button class="btn ghost delete-btn">Delete</button>
      </td>
    `;

    row.querySelector(".edit-btn").onclick = () =>
      editCategory(cat.id, cat.name);
    row.querySelector(".delete-btn").onclick = () => deleteCategory(cat.id);

    categoryTable.appendChild(row);
  });
}

// Add or Update category
document.getElementById("saveCategoryBtn").onclick = async () => {
  const name = categoryNameInput.value.trim();
  if (!name) return alert("Category name is required");

  let url = "http://127.0.0.1:8000/api/categories/";
  let method = "POST";

  if (editingCategoryId) {
    url += `${editingCategoryId}/`;
    method = "PUT";
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const err = await response.text();
    alert("Failed to save category:\n" + err);
    return;
  }

  modal.classList.add("hidden");
  loadCategories();
};

// Edit category function
function editCategory(id, name) {
  editingCategoryId = id;
  categoryNameInput.value = name;
  modalTitle.textContent = "Edit Category";
  modal.classList.remove("hidden");
}

// Delete category
async function deleteCategory(id) {
  if (!confirm("Delete this category?")) return;

  await fetch(`http://127.0.0.1:8000/api/categories/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  loadCategories();
}

loadCategories();

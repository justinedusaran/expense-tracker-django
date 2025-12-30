const accessToken = localStorage.getItem("access");
if (!accessToken) window.location.href = "login.html";

const table = document.getElementById("categoryTable");
const modal = document.getElementById("categoryModal");
const categoryNameInput = document.getElementById("categoryName");
const modalTitle = document.getElementById("modalTitle");
let editingCategoryId = null;

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
  renderCategories(categories);
}

function renderCategories(categories) {
  table.innerHTML = "";

  if (categories.length === 0) {
    table.innerHTML = `<tr><td colspan="2" class="empty">No categories yet</td></tr>`;
    return;
  }

  categories.forEach((cat) => {
    table.innerHTML += `
      <tr>
        <td>${cat.name}</td>
        <td>
          <button class="btn ghost" onclick="editCategory(${cat.id}, '${cat.name}')">Edit</button>
          <button class="btn ghost" onclick="deleteCategory(${cat.id})">Delete</button>
        </td>
      </tr>
    `;
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

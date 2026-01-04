// --- DOM Elements ---
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

// Modal elements
const successModal = document.getElementById("successModal");
const modalOkBtn = document.getElementById("modalOkBtn");

// --- Toggle between Login and Register forms ---
loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  errorMsg.textContent = "";
});

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  errorMsg.textContent = "";
});

// --- Login ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(
      "https://expense-tracker-api-9lnt.onrender.com/api/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.detail || "Invalid username or password";
      return;
    }

    // Save tokens
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    errorMsg.textContent = "Server error. Please try again later.";
    console.error("Login error:", error);
  }
});

// --- Register ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("registerUsername").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById(
    "registerConfirmPassword"
  ).value;

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match";
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = "Password must be at least 6 characters long";
    return;
  }

  try {
    const response = await fetch(
      "https://expense-tracker-api-9lnt.onrender.com/api/register/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }
    );

    if (response.ok) {
      // Show success modal
      successModal.classList.remove("hidden");
      registerForm.reset();
      errorMsg.textContent = "";
    } else {
      const data = await response.json();
      // Handle different error formats
      if (data.username) {
        errorMsg.textContent = data.username[0];
      } else if (data.email) {
        errorMsg.textContent = data.email[0];
      } else if (data.password) {
        errorMsg.textContent = data.password[0];
      } else {
        errorMsg.textContent =
          data.detail || "Registration failed. Please try again.";
      }
    }
  } catch (error) {
    errorMsg.textContent =
      "Server error. Please check if the server is running.";
    console.error("Registration error:", error);
  }
});

// --- Modal handlers ---
modalOkBtn.onclick = () => {
  successModal.classList.add("hidden");
  loginTab.click(); // Switch to login tab
};

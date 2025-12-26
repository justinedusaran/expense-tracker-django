const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = "Invalid username or password";
      return;
    }

    // Save tokens
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);

    // Redirect (next page)
    window.location.href = "dashboard.html";
  } catch (error) {
    errorMsg.textContent = "Server error. Please try again.";
  }
});

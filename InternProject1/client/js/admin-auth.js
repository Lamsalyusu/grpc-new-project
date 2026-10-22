
const adminLoginForm = document.getElementById("adminLoginForm");

adminLoginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");
  const submitButton = adminLoginForm.querySelector('button[type="submit"]');

  error.textContent = "";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";
  }

  try {
    const res = await api("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.data?.token) {
      throw new Error("Admin login did not return a token.");
    }

    setToken(res.data.token,true);

    window.location.href = "admin-dashboard.html";
  } catch (err) {
    error.textContent = err.message || "Unable to sign in. Try again.";
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Login as Admin";
    }
  }
});
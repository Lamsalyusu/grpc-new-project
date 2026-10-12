
const adminLoginForm = document.getElementById("adminLoginForm");

adminLoginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  error.textContent = "";

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
    error.textContent = err.message;
  }
});
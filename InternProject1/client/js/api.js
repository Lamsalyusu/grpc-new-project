
const API_BASE = "http://127.0.0.1:3000/api/v1";

function getToken(isAdmin = false) {
  return localStorage.getItem(isAdmin ? "adminToken" : "token");
}

function setToken(token, isAdmin = false) {
  localStorage.setItem(isAdmin ? "adminToken" : "token", token);
}

function removeToken(isAdmin = false) {
  localStorage.removeItem(isAdmin ? "adminToken" : "token");
}

async function api(endpoint, options = {}, isAdmin = false) {
  const isAuthRoute =
    endpoint.includes("/auth/login") ||
    endpoint.includes("/auth/register") ||
    endpoint.includes("/admin/login") ||
    endpoint.includes("/admin/register");

  const token = getToken(isAdmin);

  if (!isAuthRoute && isTokenExpired(isAdmin)) {
    logout(isAdmin);
    throw new Error("Session expired. Please log in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !isAuthRoute) {
    logout(isAdmin);
    throw new Error("Unauthorized session. Please log in again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data.error?.message ||
      data.message ||
      "Something went wrong";

    throw new Error(msg);
  }

  return data;
}

function redirectIfNotAuth(isAdmin = false) {
  if (!getToken(isAdmin) || isTokenExpired(isAdmin)) {
    logout(isAdmin);
  }
}

function isTokenExpired(isAdmin = false) {
  const token = getToken(isAdmin);
  if (!token) return true;

  try {
    const tokenParts = token.split(".");
    const base64Url = tokenParts[1];

    if (!base64Url) return true;

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          c =>
            "%" +
            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    const { exp } = JSON.parse(jsonPayload);

    if (typeof exp !== "number") return true;

    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function logout(isAdmin = false) {
  removeToken(isAdmin);

  window.location.href = isAdmin
    ? "admin-login.html"
    : "index.html";
}

document.getElementById("btnLogout")?.addEventListener("click", () => {
  const isAdmin = window.location.pathname
    .split("/")
    .pop()
    .startsWith("admin-");

  logout(isAdmin);
});
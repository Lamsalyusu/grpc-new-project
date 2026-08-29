const API_BASE = 'http://127.0.0.1:3000/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
}

async function api(endpoint, options = {}) {
  const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
  if (!isAuthRoute && isTokenExpired()) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  
 if (res.status === 401) {
    logout();
    throw new Error('Unauthorized session. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.error?.message || data.message || 'Something went wrong';
    throw new Error(msg);
  }

  return data;
}

function redirectIfNotAuth() {
  console.log("hello")
  if (!getToken()||isTokenExpired()) {
    // window.location.href = 'index.html';
    logout();
  }
}

function isTokenExpired() {
  const token = getToken();
  if (!token) return true;

  try {
    // JWT structure is: Header.Payload.Signature
    const tokenparts = token.split('.');
    const base64Url =tokenparts[1];
    if(!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch (err) {
    // If the token is corrupted or malformed, treat it as expired
    return true;
  }
}

function logout() {
  removeToken();
  window.location.href = 'index.html';
}

document.getElementById('btnLogout')?.addEventListener('click',logout)
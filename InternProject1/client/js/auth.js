const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.data.token);
      window.location.href = 'dashboard.html';
    } catch (err) {
      document.getElementById('error').textContent = err.message;
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      alert('Registered! Please login.');
      window.location.href = 'index.html';
    } catch (err) {
      document.getElementById('error').textContent = err.message;
    }
  });
}
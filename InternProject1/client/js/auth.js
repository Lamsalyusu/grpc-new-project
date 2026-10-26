const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error');
    errorMessage.textContent = '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
    }

    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.data.token);
      window.location.href = 'dashboard.html';
    } catch (err) {
      errorMessage.textContent = err.message || 'Unable to sign in. Try again.';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Sign in';
      }
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error');
    errorMessage.textContent = '';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Creating account...';
    }

    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      errorMessage.textContent = 'Account created. Redirecting to sign in...';
      window.setTimeout(() => {
        window.location.href = 'index.html';
      }, 700);
    } catch (err) {
      errorMessage.textContent = err.message || 'Unable to create your account. Try again.';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Create account';
      }
    }
  });
}
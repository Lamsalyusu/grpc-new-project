redirectIfNotAuth();

async function loadProfile() {
  try {
    const res = await api('/auth/me');
    const user = res.data;
    
    document.getElementById('pName').textContent = user.name;
    document.getElementById('pEmail').textContent = user.email;
    document.getElementById('pRole').textContent = user.role || 'user';
    // document.getElementById('pJoined').textContent = new Date(user.created_at).toLocaleDateString();
  } catch (err) {
    alert(err.message);
    logout();
  }
}

document.getElementById('btnLogout')?.addEventListener('click', logout);
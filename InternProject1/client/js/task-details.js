const params = new URLSearchParams(window.location.search);
const taskId = params.get('id');
let currentUserId = null;

async function initTaskDetail() {
  if (!taskId) return window.location.href = 'dashboard.html';

  // 1. Get current logged-in user
  try {
    const meRes = await api('/auth/me');
    currentUserId = meRes.data.id;
  } catch (err) {
    logout();
    return;
  }

  // 2. Load task
  let task;
  try {
    const res = await api(`/tasks/${taskId}`);
    task = res.data;
    
    // HIDE collaborators section if NOT owner
    if (currentUserId !== task.owner_id) {
      const collabSection = document.getElementById('collabSection');
      if (collabSection) collabSection.style.display = 'none';
    }
    
    document.getElementById('taskInfo').innerHTML = `
      <h1>${(task.title)}</h1>
      <p>${(task.description || '')}</p>
      <div class="task-meta">
        <span class="badge badge-${task.status}">${task.status}</span>
        <span class="badge badge-${task.priority}">${task.priority}</span>
        <span>Due: ${task.due_date ? new Date(task.due_date).toLocaleString() : '—'}</span>
      </div>
    `;
  } catch (err) {
    alert(err.message);
    return;
  }

  loadCollaborators();
  loadMessages();
  initChat(taskId);
}

async function loadCollaborators() {
  try {
    const res = await api(`/tasks/${taskId}/collaborators`);
    const list = document.getElementById('collaborators');
    const collabs = res.data || [];

    if (collabs.length === 0) {
      list.innerHTML = '<p style="color:#666;font-size:14px;">No collaborators yet.</p>';
      return;
    }

    list.innerHTML = collabs.map(c => {
      const name = c.user?.name || c.user?.email || c.user_id;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f9f9f9;border-radius:8px;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:50%;background:#2563eb;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">
              ${name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;font-size:14px;">${escapeHtml(name)}</div>
              <div style="font-size:12px;color:#666;">${escapeHtml(c.user?.email || '')}</div>
            </div>
          </div>
          <button class="btn-remove-collab" data-userid="${c.user_id}" style="width:auto;padding:6px 12px;font-size:12px;background:#ef4444;color:white;border:none;border-radius:6px;cursor:pointer;">Remove</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.btn-remove-collab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.target.dataset.userid;
        removeCollab(userId);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('addCollabForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('collabEmail').value;
  try {
    await api(`/tasks/${taskId}/collaborators`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    document.getElementById('collabEmail').value = '';
    loadCollaborators();
  } catch (err) {
    alert(err.message);
  }
});

async function removeCollab(userId) {
  if (!confirm('Remove this collaborator?')) return;
  try {
    await api(`/tasks/${taskId}/collaborators/${userId}`, { method: 'DELETE' });
    loadCollaborators();
  } catch (err) {
    alert(err.message);
  }
}

async function loadMessages() {
  try {
    const res = await api(`/tasks/${taskId}/messages?page=1&limit=50`);
    const msgs = res.data?.rows || res.data || [];
    const box = document.getElementById('chatMessages');
    box.innerHTML = msgs.map(m => renderMsg(m)).join('');
    box.scrollTop = box.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}

function renderMsg(m) {
  const senderName = m.sender?.name || m.sender?.email || 'Unknown';
  return `
    <div class="msg">
      <strong>${escapeHtml(senderName)}</strong>
      <time>${new Date(m.created_at).toLocaleTimeString()}</time>
      <p>${escapeHtml(m.body)}</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

document.getElementById('btnLogout')?.addEventListener('click', logout);
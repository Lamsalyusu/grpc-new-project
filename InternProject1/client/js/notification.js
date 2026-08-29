const ONE_WEEK = 7*24*60*60*1000;
function notifvisible(n){
  //if unread always visible
  if(!n.read_at) return true;
  const readDate = new Date(n.read_at).getTime();
  const now = Date.now();
  return (now-readDate)< ONE_WEEK;
}
  
  async function loadNotifications() {
  try {
    const res = await api('/notifications?page=1&limit=20');
    const list = document.getElementById('notificationsList');
    const notifs = res.data || [];
    const notification = notifs.filter(notifvisible);
    if (notifs.length === 0) {
      list.innerHTML = '<p>No notifications.</p>';
      return;
    }

    list.innerHTML = notifs.map(n => {
      const payload = n.payload || {};
      const isRead = !!n.read_at;

      
      let content = '';
      
      if (n.type === 'reminder') {
        content = `
          <div>
            <strong>⏰ Reminder: ${escapeHtml(payload.title || 'Task')}</strong>
            <p style="font-size:13px;color:#666;margin-top:4px;">${escapeHtml(payload.description || '')}</p>
            <p style="font-size:12px;color:#ef4444;">Due: ${payload.due_date ? new Date(payload.due_date).toLocaleString() : '—'}</p>
          </div>
        `;
      } else if (n.type === 'TASK_COLLABORATOR_ADDED') {
        content = `<strong>🤝 Added as collaborator</strong>`;
      } else {
        content = `<strong>${escapeHtml(n.type)}</strong>`;
      }

      // Read = blurred/faded, Unread = normal
      const cardClass = isRead ? 'notification-read' : 'notification-unread';
      const badgeHtml = isRead 
        ? '<span style="font-size:11px;color:#666;background:#e5e5e5;padding:2px 8px;border-radius:4px;">Read</span>'
        : '<span style="font-size:11px;color:#fff;background:#2563eb;padding:2px 8px;border-radius:4px;">New</span>';

      return `
        <div class="task-card ${cardClass}" style="display:flex;justify-content:space-between;align-items:center;">
          <div style="flex:1;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              ${badgeHtml}
              <time style="font-size:12px;color:#999;">${new Date(n.created_at).toLocaleString()}</time>
            </div>
            ${content}
          </div>
          ${!isRead ? `
            <button class="btn-mark-read" data-id="${n.id}" style="width:auto;padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;margin-left:12px;">Mark Read</button>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach listeners only to unread notifications
    list.querySelectorAll('.btn-mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => markRead(e.target.dataset.id));
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadUnreadCount() {
  try {
    const res = await api('/notifications/unread/count');
    const count = res.data?.count || 0;
    const badge = document.getElementById('unreadBadge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function markRead(id) {
  try {
    await api(`/notifications/${id}/read`, { method: 'PUT' });
    loadNotifications();
    loadUnreadCount();
  } catch (error) {
    alert(error .message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('btnLogout')?.addEventListener('click', logout);
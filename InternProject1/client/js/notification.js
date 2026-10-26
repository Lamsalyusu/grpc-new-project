const ONE_WEEK = 7*24*60*60*1000;
function notifvisible(n){
  //if unread always visible
  if(!n.read_at) return true;
  const readDate = new Date(n.read_at).getTime();
  const now = Date.now();
  return (now-readDate)< ONE_WEEK;
}
  
  async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  const status = document.getElementById('notificationStatus');
  if (!list) return;
  list.setAttribute('aria-busy', 'true');
  if (status) status.textContent = 'Loading notifications...';

  try {
    const res = await api('/notifications?page=1&limit=5');
    const notifs = Array.isArray(res.data) ? res.data : [];
  
    const notification = notifs.filter(notifvisible);
    if (notification.length === 0) {
      list.innerHTML = '<p class="task-list-state"><strong>You are all caught up</strong><span>No recent notifications to show.</span></p>';
      if (status) status.textContent = 'No recent notifications.';
      return;
    }

    list.innerHTML = notification.map(n => {
      let payload = {};

      try {
        payload = typeof n.payload === 'string'
          ? JSON.parse(n.payload)
          : (n.payload || {});
      } catch (err) {
        console.error('Invalid notification payload:', n.payload);
      }
      const isRead = !!n.read_at;

      
      let content = '';
      
      if (n.type === 'reminder') {
        content = `
          <div>
            <strong>Reminder: ${escapeHtml(payload.title || 'Task')}</strong>
            <p class="notification-copy">${escapeHtml(payload.description || '')}</p>
            <p class="notification-due">Due: ${payload.due_date ? new Date(payload.due_date).toLocaleString() : '—'}</p>
          </div>
        `;
      } else if (n.type === 'TASK_COLLABORATOR_ADDED') {
        content = `<strong> Added as collaborator</strong>`;
      } else {
        content = `<strong>${escapeHtml(n.type)}</strong>`;
      }

      // Read = blurred/faded, Unread = normal
      const cardClass = isRead ? 'notification-read' : 'notification-unread';
      const badgeHtml = isRead
        ? '<span class="notification-state is-read">Read</span>'
        : '<span class="notification-state is-new">New</span>';

      return `
        <div class="task-card notification-item ${cardClass}">
          <div class="notification-content">
            <div class="notification-meta">
              ${badgeHtml}
              <time class="notification-time">${new Date(n.created_at).toLocaleString()}</time>
            </div>
            ${content}
          </div>
          ${!isRead ? `
            <button class="btn-mark-read" data-id="${escapeHtml(n.id)}" aria-label="Mark notification as read">Mark read</button>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach listeners only to unread notifications
    list.querySelectorAll('.btn-mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => markRead(e.target.dataset.id));
    });
    if (status) status.textContent = `${notification.length} recent ${notification.length === 1 ? 'notification' : 'notifications'}.`;
  } catch (err) {
    console.error(err);
    list.innerHTML = '<p class="task-list-state task-list-error">Could not load notifications.</p>';
    if (status) status.textContent = err.message || 'Could not load notifications.';
  } finally {
    list.setAttribute('aria-busy', 'false');
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
  const status = document.getElementById('notificationStatus');
  try {
    await api(`/notifications/${id}/read`, { method: 'PUT' });
    if (status) status.textContent = 'Notification marked as read.';
    await Promise.all([loadNotifications(), loadUnreadCount()]);
  } catch (error) {
    if (status) status.textContent = error.message || 'Could not mark notification as read.';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('btnLogout')?.addEventListener('click', logout);
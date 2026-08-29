

redirectIfNotAuth();

// ─── Helpers ───
function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date();
}

function getDisplayStatus(task) {
  if (task.status === 'completed') return 'completed';
  if (isOverdue(task.due_date, task.status)) return 'missing';
  return task.status;
}

function getStatusColor(status) {
  const colors = {
    pending: '#f59e0b',      // amber
    in_progress: '#3b82f6',  // blue
    completed: '#10b981',    // green
    missing: '#ef4444',      // red
  };
  return colors[status] || '#666';
}

// ─── Load Tasks ───
async function loadTasks() {
  const status = document.getElementById('filterStatus')?.value || '';
  const priority = document.getElementById('filterPriority')?.value || '';
  
  let url = '/tasks?page=1&limit=20';
  if (status) url += `&status=${status}`;
  if (priority) url += `&priority=${priority}`;

  try {
    const res = await api(url);
    const tasks = res.data?.rows || [];
    const list = document.getElementById('tasksList');
    list.innerHTML = '';

    if (tasks.length === 0) {
      list.innerHTML = '<p>No tasks found.</p>';
      return;
    }

    tasks.forEach(task => {
      const displayStatus = getDisplayStatus(task);
      const statusColor = getStatusColor(displayStatus);
      
      const card = document.createElement('div');
      card.className = 'task-card';
      card.style.borderLeft = `4px solid ${statusColor}`;
      
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start;">
          <div style="flex:1; cursor:pointer;" class="task-clickable">
            <h3>${(task.title)}</h3>
            <p>${(task.description || '')}</p>
            <div class="task-meta">
              <span class="badge" style="background:${statusColor}20; color:${statusColor}; border:1px solid ${statusColor};">
                ${displayStatus}
              </span>
              <span class="badge badge-${task.priority}">${task.priority}</span>
              <span style="${isOverdue(task.due_date, task.status) && task.status !== 'completed' ? 'color:#ef4444; font-weight:bold;' : ''}">
                Due: ${task.due_date ? new Date(task.due_date).toLocaleString() : '—'}
              </span>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-left:12px;">
            <button class="btn-edit" data-id="${task.id}" style="width:auto; padding:4px 10px; font-size:12px; background:#3b82f6;">Edit</button>
            <button class="btn-delete" data-id="${task.id}" style="width:auto; padding:4px 10px; font-size:12px; background:#ef4444;">Delete</button>
          </div>
        </div>
      `;
      
      card.querySelector('.task-clickable').addEventListener('click', () => {
        window.location.href = `task-detail.html?id=${task.id}`;
      });
      
      // Edit button
      card.querySelector('.btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(task);
      });
      
      // Delete button
      card.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });
      
      list.appendChild(card);
    });
  } catch (err) {
    alert(err.message);
  }
}


async function loadSharedTasks() {
  try {
    const res = await api('/tasks/shared-with-me');
    const collabRows = res.data || [];
    const list = document.getElementById('sharedTasksList');
    list.innerHTML = '';

    if (collabRows.length === 0) {
      list.innerHTML = '<p>No shared tasks yet.</p>';
      return;
    }

    collabRows.forEach(row => {
      const task = row.Task || row.task;
      if (!task) return;

      const card = document.createElement('div');
      card.className = 'task-card';
      card.addEventListener('click', () => {
        window.location.href = `task-detail.html?id=${task.id}`;
      });
      card.innerHTML = `
        <h3>${(task.title)}</h3>
        <p>${(task.description || '')}</p>
        <div class="task-meta">
          <span class="badge badge-${task.status}">${task.status}</span>
          <span class="badge badge-${task.priority}">${task.priority}</span>
          <span>Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</span>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('sharedTasksList').innerHTML = '<p>Could not load shared tasks.</p>';
  }
}

function openModal() {
  document.getElementById('modal').classList.add('active');
}
function closeModal() {
  document.getElementById('modal').classList.remove('active');
// 
}
const now = new Date();

// Adjust for local timezone offset to get local time string
const offset = now.getTimezoneOffset() * 60000;
const localISOTime = new Date(now - offset).toISOString();

// Slice string to extract 'YYYY-MM-DDTHH:MM'
const currentDateTime = localISOTime.slice(0, 16);

// FIX 1: Set min constraints immediately on page load, not during submit
const dueDateInput = document.getElementById('due_date');
const reminderInput = document.getElementById('reminder_at');
const editDueDateInput = document.getElementById('editDueDate');
const editReminderInput = document.getElementById('editReminderAt');

if (dueDateInput) dueDateInput.setAttribute('min', currentDateTime);
if (reminderInput) reminderInput.setAttribute('min', currentDateTime);
if (editDueDateInput) editDueDateInput.setAttribute('min', currentDateTime);
if (editReminderInput) editReminderInput.setAttribute('min', currentDateTime);

const createForm = document.getElementById('createTaskForm');
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // FIX 2: Correctly pull .value instead of the setAttribute outcome
    const dueDateVal = document.getElementById('due_date').value;
    const reminderVal = document.getElementById('reminder_at').value;
    
    const body = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      status: 'pending',  // ← Always pending
      priority: document.getElementById('priority').value,
      due_date:  new Date(dueDateVal).toISOString(),
      reminder_at: new Date(reminderVal).toISOString()
    };

    try {
      await api('/tasks', { method: 'POST', body: JSON.stringify(body) });
      closeModal();
      createForm.reset();
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  });
}

function openEditModal(task) {
  document.getElementById('editId').value = task.id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDescription').value = task.description || '';
  document.getElementById('editStatus').value = getDisplayStatus(task);
  document.getElementById('editPriority').value = task.priority;
  document.getElementById('editDueDate').value = task.due_date 
    ? new Date(task.due_date).toISOString().slice(0, 16) 
    : '';
  document.getElementById('editReminderAt').value = task.reminder_at 
    ? new Date(task.reminder_at).toISOString().slice(0, 16) 
    : '';
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

const editForm = document.getElementById('editTaskForm');
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const dueDateVal = document.getElementById('editDueDate').value;
    const reminderVal = document.getElementById('editReminderAt').value;
    
    const body = {
      title: document.getElementById('editTitle').value,
      description: document.getElementById('editDescription').value,
      status: document.getElementById('editStatus').value,
      priority: document.getElementById('editPriority').value,
      due_date: dueDateVal ? new Date(dueDateVal).toISOString() : null,
      reminder_at: reminderVal ? new Date(reminderVal).toISOString() : null,
    };

    try {
      await api(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      closeEditModal();
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  try {
    await api(`/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  } catch (err) {
    alert(err.message);
  }
}

// ─── Event Listeners ───
document.getElementById('btnFilter')?.addEventListener('click', loadTasks);
document.getElementById('btnOpenModal')?.addEventListener('click', openModal);
document.getElementById('btnCloseModal')?.addEventListener('click', closeModal);
document.getElementById('btnCloseEditModal')?.addEventListener('click', closeEditModal);

// function escapeHtml(text) {
//   const div = document.createElement('div');
//   div.textContent = text;
//   return div.innerHTML;
// }
// Auto-refresh every 30 seconds to catch overdue tasks
setInterval(loadTasks, 30000);

loadTasks();

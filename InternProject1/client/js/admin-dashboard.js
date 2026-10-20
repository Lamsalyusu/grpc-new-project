redirectIfNotAuth(true);

const ownerSelect = document.getElementById("owner_id");
const taskForm = document.getElementById("adminTaskForm");
const message = document.getElementById("adminMessage");
const createTaskBtn = document.getElementById("createTaskBtn");
const userTableBody = document.getElementById("userTableBody");
const userSearch = document.getElementById("userSearch");
const refreshUsersBtn = document.getElementById("refreshUsers");
const userEditForm = document.getElementById("userEditForm");
const editUserId = document.getElementById("editUserId");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editRole = document.getElementById("editRole");
const userEditorDrawer = document.getElementById("userEditorDrawer");
const closeUserEditor = document.getElementById("closeUserEditor");

const adminTasksBody = document.getElementById("adminTasksBody");
const taskSearch = document.getElementById("taskSearch");
const taskStatusFilter = document.getElementById("taskStatusFilter");
const taskPriorityFilter = document.getElementById("taskPriorityFilter");
const taskTrackingMessage = document.getElementById("taskTrackingMessage");
const taskCount = document.getElementById("taskCount");
const refreshAdminTasks = document.getElementById("refreshAdminTasks");

let allUsers = [];
let adminTasks = [];
let ownerNames = new Map();

function showMessage(element, text, type = "info") {
  if (!element) return;
  element.textContent = text;
  element.className = `inline-message ${type}`;
}

function toISOStringOrNull(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Please enter a valid date.");
  }

  return date.toISOString();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function formatTaskDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function formatTaskLabel(value) {
  if (!value) return "—";

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function updateStats() {
  const statUsers = document.getElementById("statUsers");
  const statTasks = document.getElementById("statTasks");
  const statPending = document.getElementById("statPending");

  if (statUsers) statUsers.textContent = String(allUsers.length || 0);
  if (statTasks) statTasks.textContent = String(adminTasks.length || 0);
  if (statPending) {
    const pending = adminTasks.filter((task) => {
      const status = String(task.status || "").toLowerCase();
      return status === "pending" || status === "in_progress";
    }).length;
    statPending.textContent = String(pending);
  }
}

async function loadUsers() {
  if (ownerSelect) ownerSelect.innerHTML = '<option value="">Loading users...</option>';

  try {
    const res = await api("/admin/users", {}, true);
    const users = res.data?.users ?? (Array.isArray(res.data) ? res.data : []);

    if (!Array.isArray(users)) {
      throw new Error("Could not read the users list from the API response.");
    }

    allUsers = users;

    if (ownerSelect) {
      ownerSelect.innerHTML = "";
      if (users.length === 0) {
        ownerSelect.innerHTML = '<option value="">No users found</option>';
      } else {
        ownerSelect.add(new Option("Select a user", ""));
        users.forEach((user) => {
          const userId = user.id ?? user.user_id;
          if (!userId) return;

          const displayName = user.name || user.email || String(userId);
          const label = user.email && displayName !== user.email ? `${displayName} (${user.email})` : displayName;
          ownerSelect.add(new Option(label, userId));
        });
      }
    }

    renderUserTable();
    updateStats();
  } catch (err) {
    if (ownerSelect) ownerSelect.innerHTML = '<option value="">Failed to load users</option>';
    if (message) showMessage(message, err.message || "Failed to load users.", "error");
  }
}

function renderUserTable() {
  if (!userTableBody) return;

  const search = (userSearch?.value || "").trim().toLowerCase();
  const filteredUsers = allUsers.filter((user) => {
    const userName = String(user.name || "").toLowerCase();
    const userEmail = String(user.email || "").toLowerCase();
    return userName.includes(search) || userEmail.includes(search);
  });

  if (!filteredUsers.length) {
    userTableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
    return;
  }

  userTableBody.innerHTML = filteredUsers.map((user) => {
    const role = user.role || "user";
    return `
      <tr>
        <td>${escapeHtml(user.name || "Unknown")}</td>
        <td>${escapeHtml(user.email || "—")}</td>
        <td>${escapeHtml(role)}</td>
        <td>
          <div class="user-actions">
            <button type="button" class="action-edit" data-action="edit" data-user-id="${user.id}">Edit</button>
            <button type="button" class="action-delete" data-action="delete" data-user-id="${user.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

if (userSearch) {
  userSearch.addEventListener("input", renderUserTable);
}

if (refreshUsersBtn) {
  refreshUsersBtn.addEventListener("click", loadUsers);
}

if (userTableBody) {
  userTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const userId = button.dataset.userId;
    const action = button.dataset.action;

    if (!userId) return;

    const user = allUsers.find((item) => String(item.id) === String(userId));
    if (!user) return;

    if (action === "edit") {
      if (editUserId) editUserId.value = user.id;
      if (editName) editName.value = user.name || "";
      if (editEmail) editEmail.value = user.email || "";
      if (editRole) editRole.value = user.role || "user";
      if (userEditorDrawer) userEditorDrawer.classList.add("visible");
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(`Delete ${user.name || user.email || "this user"}?`);
      if (!confirmed) return;

      try {
        await api(`/admin/users/${userId}`, { method: "DELETE" }, true);
        await loadUsers();
        await loadAdminTasks();
        showMessage(message, "User deleted successfully.", "success");
      } catch (err) {
        showMessage(message, err.message || "Could not delete user.", "error");
      }
    }
  });
}

if (closeUserEditor) {
  closeUserEditor.addEventListener("click", () => {
    if (userEditorDrawer) userEditorDrawer.classList.remove("visible");
  });
}

if (userEditForm) {
  userEditForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userId = editUserId?.value;
    if (!userId) return;

    const payload = {
      name: editName?.value?.trim(),
      email: editEmail?.value?.trim(),
      role: editRole?.value,
    };

    try {
      await api(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }, true);

      if (userEditorDrawer) userEditorDrawer.classList.remove("visible");
      await loadUsers();
      showMessage(message, "User updated successfully.", "success");
    } catch (err) {
      showMessage(message, err.message || "Could not update user.", "error");
    }
  });
}

if (taskForm) {
  taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (message) message.className = "inline-message info";

    const owner_id = ownerSelect?.value;
    const title = document.getElementById("title")?.value.trim();
    const description = document.getElementById("description")?.value.trim();
    const priority = document.getElementById("priority")?.value;
    const dueDateInput = document.getElementById("due_date")?.value;
    const reminderInput = document.getElementById("reminder_at")?.value;

    if (!owner_id) {
      showMessage(message, "Please select a task owner.", "error");
      return;
    }

    if (!title) {
      showMessage(message, "Task title is required.", "error");
      return;
    }

    let due_date;
    let reminder_at;

    try {
      due_date = toISOStringOrNull(dueDateInput);
      reminder_at = toISOStringOrNull(reminderInput);
    } catch (err) {
      showMessage(message, err.message || "Please enter valid dates.", "error");
      return;
    }

    const taskData = { owner_id, title, description, priority, due_date, reminder_at };

    if (createTaskBtn) {
      createTaskBtn.disabled = true;
      createTaskBtn.textContent = "Creating...";
    }

    try {
      const res = await api("/admin/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      }, true);

      showMessage(message, res.message || "Task created successfully!", "success");
      taskForm.reset();
      if (document.getElementById("priority")) document.getElementById("priority").value = "medium";
      await loadAdminTasks();
    } catch (err) {
      showMessage(message, err.message || "Failed to create task.", "error");
    } finally {
      if (createTaskBtn) {
        createTaskBtn.disabled = false;
        createTaskBtn.textContent = "Create task";
      }
    }
  });
}

async function loadAdminTasks() {
  if (!adminTasksBody) return;

  adminTasksBody.innerHTML = '<tr><td colspan="6">Loading tasks...</td></tr>';
  if (taskTrackingMessage) taskTrackingMessage.textContent = "";
  if (taskCount) taskCount.textContent = "";
  if (refreshAdminTasks) refreshAdminTasks.disabled = true;

  try {
    const res = await api("/admin/tasks", {}, true);
    const tasks = res.data?.tasks;

    if (!Array.isArray(tasks)) {
      throw new Error("Unexpected response from the admin tasks endpoint.");
    }

    adminTasks = tasks;
    renderAdminTasks();
    updateStats();
  } catch (err) {
    adminTasksBody.innerHTML = '<tr><td colspan="6">Could not load tasks.</td></tr>';
    if (taskTrackingMessage) taskTrackingMessage.textContent = err.message || "Could not load tasks.";
  } finally {
    if (refreshAdminTasks) refreshAdminTasks.disabled = false;
  }
}

function renderAdminTasks() {
  if (!adminTasksBody || !taskSearch || !taskStatusFilter || !taskPriorityFilter || !taskCount) return;

  const search = taskSearch.value.trim().toLowerCase();
  const status = taskStatusFilter.value;
  const priority = taskPriorityFilter.value;

  const filteredTasks = adminTasks.filter((task) => {
    const ownerName = ownerNames.get(String(task.owner_id)) || task.owner_id || "";
    const matchesSearch =
      String(task.title || "").toLowerCase().includes(search) ||
      String(ownerName).toLowerCase().includes(search);

    const matchesStatus = !status || task.status === status;
    const matchesPriority = !priority || task.priority === priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!filteredTasks.length) {
    adminTasksBody.innerHTML = '<tr><td colspan="6">No matching tasks found.</td></tr>';
  } else {
    adminTasksBody.innerHTML = filteredTasks.map((task) => {
      const ownerName = ownerNames.get(String(task.owner_id)) || task.owner_id || "Unknown";
      return `
        <tr>
          <td>${escapeHtml(task.title || "Untitled")}</td>
          <td>${escapeHtml(ownerName)}</td>
          <td class="task-priority">${escapeHtml(formatTaskLabel(task.priority))}</td>
          <td><span class="task-status">${escapeHtml(formatTaskLabel(task.status))}</span></td>
          <td>${escapeHtml(formatTaskDate(task.due_date))}</td>
          <td>${escapeHtml(formatTaskDate(task.created_at))}</td>
        </tr>
      `;
    }).join("");
  }

  taskCount.textContent = `Showing ${filteredTasks.length} of ${adminTasks.length} tasks`;
}

if (taskSearch) taskSearch.addEventListener("input", renderAdminTasks);
if (taskStatusFilter) taskStatusFilter.addEventListener("change", renderAdminTasks);
if (taskPriorityFilter) taskPriorityFilter.addEventListener("change", renderAdminTasks);
if (refreshAdminTasks) refreshAdminTasks.addEventListener("click", loadAdminTasks);

async function loadAdminTaskTracking() {
  try {
    const res = await api("/admin/users", {}, true);
    const users = res.data?.users ?? (Array.isArray(res.data) ? res.data : []);

    if (Array.isArray(users)) {
      users.forEach((user) => {
        const id = user.id ?? user.user_id;
        if (!id) return;
        const name = user.name || user.email || id;
        ownerNames.set(String(id), name);
      });
    }
  } catch (err) {
    console.error("Could not load owner names:", err);
  }

  await loadUsers();
  await loadAdminTasks();
}

loadAdminTaskTracking();

redirectIfNotAuth(true);

const ownerSelect = document.getElementById("owner_id");
const taskForm = document.getElementById("adminTaskForm");
const message = document.getElementById("adminMessage");
const createTaskBtn = document.getElementById("createTaskBtn");

function showMessage(text, type = "info") {
  message.textContent = text;
  message.className = `admin-message admin-${type}`;
}

// Convert a datetime-local value into an ISO timestamp.
// Return null when the optional date has not been selected.
function toISOStringOrNull(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Please enter a valid date.");
  }

  return date.toISOString();
}

// Load users from the existing admin endpoint.
async function loadUsers() {
  ownerSelect.innerHTML = '<option value="">Loading users...</option>';

  try {
    const res = await api("/admin/users",{},true);

    // Support common response shapes without changing the API.
    const users =
      res.data?.users ??
      res.data?.data?.users ??
      (Array.isArray(res.data) ? res.data : null) ??
      res.users ??
      (Array.isArray(res.data?.data) ? res.data.data : null);

    if (!Array.isArray(users)) {
      throw new Error(
        "Could not read the users list from the API response."
      );
    }

    ownerSelect.innerHTML = "";

    if (users.length === 0) {
      ownerSelect.innerHTML =
        '<option value="">No users found</option>';
      return;
    }

    ownerSelect.add(new Option("Select a user", ""));

    users.forEach((user) => {
      const userId = user.id ?? user.user_id;

      if (!userId) return;

      const displayName =
        user.name ||
        user.full_name ||
        user.username ||
        user.email ||
        String(userId);

      const label = user.email && displayName !== user.email
        ? `${displayName} (${user.email})`
        : displayName;

      ownerSelect.add(new Option(label, userId));
    });

    if (ownerSelect.options.length <= 1) {
      ownerSelect.innerHTML =
        '<option value="">No assignable users found</option>';
    }
  } catch (err) {
    ownerSelect.innerHTML =
      '<option value="">Failed to load users</option>';

    showMessage(err.message, "error");
  }
}

// Create a task for the selected user.
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  message.textContent = "";

  const owner_id = ownerSelect.value;
  const title = document.getElementById("title").value.trim();
  const description =
    document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;
  const dueDateInput = document.getElementById("due_date").value;
  const reminderInput = document.getElementById("reminder_at").value;

  if (!owner_id) {
    showMessage("Please select a task owner.", "error");
    return;
  }

  if (!title) {
    showMessage("Task title is required.", "error");
    return;
  }

  let due_date;
  let reminder_at;

  try {
    due_date = toISOStringOrNull(dueDateInput);
    reminder_at = toISOStringOrNull(reminderInput);
  } catch (err) {
    showMessage(err.message, "error");
    return;
  }

  const taskData = {
    owner_id,
    title,
    description,
    priority,
    due_date,
    reminder_at,
  };

  createTaskBtn.disabled = true;
  createTaskBtn.textContent = "Creating...";

  try {
    const res = await api("/admin/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    },true);

    showMessage(
      res.message || "Task created successfully!",
      "success"
    );

    taskForm.reset();
    document.getElementById("priority").value = "medium";
  } catch (err) {
    showMessage(err.message, "error");
  } finally {
    createTaskBtn.disabled = false;
    createTaskBtn.textContent = "Create Task";
  }
});

// Load the user list when the dashboard opens.
loadUsers();


const adminTasksBody = document.getElementById("adminTasksBody");
const taskSearch = document.getElementById("taskSearch");
const taskStatusFilter = document.getElementById("taskStatusFilter");
const taskPriorityFilter = document.getElementById("taskPriorityFilter");
const taskTrackingMessage = document.getElementById("taskTrackingMessage");
const taskCount = document.getElementById("taskCount");
const refreshAdminTasks = document.getElementById("refreshAdminTasks");

let adminTasks = [];
let ownerNames = new Map();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
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

async function loadAdminTasks() {
  adminTasksBody.innerHTML =
    '<tr><td colspan="6">Loading tasks...</td></tr>';

  taskTrackingMessage.textContent = "";
  taskCount.textContent = "";

  if (refreshAdminTasks) {
    refreshAdminTasks.disabled = true;
  }

  try {
    const res = await api("/admin/tasks",{},true);

    const tasks = res.data?.tasks;

    if (!Array.isArray(tasks)) {
      throw new Error(
        "Unexpected response from the admin tasks endpoint."
      );
    }

    adminTasks = tasks;
    renderAdminTasks();
  } catch (err) {
    adminTasksBody.innerHTML =
      '<tr><td colspan="6">Could not load tasks.</td></tr>';

    taskTrackingMessage.textContent = err.message;
  } finally {
    if (refreshAdminTasks) {
      refreshAdminTasks.disabled = false;
    }
  }
}

function renderAdminTasks() {
  const search = taskSearch.value.trim().toLowerCase();
  const status = taskStatusFilter.value;
  const priority = taskPriorityFilter.value;

  const filteredTasks = adminTasks.filter((task) => {
    const ownerName =
      ownerNames.get(String(task.owner_id)) || task.owner_id || "";

    const matchesSearch =
      String(task.title || "").toLowerCase().includes(search) ||
      String(ownerName).toLowerCase().includes(search);

    const matchesStatus =
      !status || task.status === status;

    const matchesPriority =
      !priority || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (filteredTasks.length === 0) {
    adminTasksBody.innerHTML =
      '<tr><td colspan="6">No matching tasks found.</td></tr>';
  } else {
    adminTasksBody.innerHTML = filteredTasks.map((task) => {
      const ownerName =
        ownerNames.get(String(task.owner_id)) ||
        task.owner_id ||
        "Unknown";

      return `
        <tr>
          <td>${escapeHtml(task.title || "Untitled")}</td>
          <td>${escapeHtml(ownerName)}</td>
          <td class="task-priority">
            ${escapeHtml(formatTaskLabel(task.priority))}
          </td>
          <td>
            <span class="task-status">
              ${escapeHtml(formatTaskLabel(task.status))}
            </span>
          </td>
          <td>${escapeHtml(formatTaskDate(task.due_date))}</td>
          <td>${escapeHtml(formatTaskDate(task.created_at))}</td>
        </tr>
      `;
    }).join("");
  }

  taskCount.textContent =
    `Showing ${filteredTasks.length} of ${adminTasks.length} tasks`;
}

taskSearch.addEventListener("input", renderAdminTasks);
taskStatusFilter.addEventListener("change", renderAdminTasks);
taskPriorityFilter.addEventListener("change", renderAdminTasks);
refreshAdminTasks.addEventListener("click", loadAdminTasks);

// Load tasks after users are available so their names can be displayed.
async function loadAdminTaskTracking() {
  try {
    const res = await api("/admin/users",{},true);
    const users = res.data?.users;

    if (Array.isArray(users)) {
      users.forEach((user) => {
        const id = user.id ?? user.user_id;
        if (!id) return;

        const name =
          user.name ||
          user.full_name ||
          user.username ||
          user.email ||
          id;

        ownerNames.set(String(id), name);
      });
    }
  } catch (err) {
    // Task tracking can still work when user names cannot be loaded.
    console.error("Could not load owner names:", err);
  }

  await loadAdminTasks();
}

loadAdminTaskTracking();
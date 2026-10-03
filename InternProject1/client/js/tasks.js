redirectIfNotAuth();

function isOverdue(dueDate, status) {
  if (!dueDate || status === "completed") 
    return false;

  return new Date(dueDate) < new Date();
}

function getDisplayStatus(task) {
  if (task.status === "completed") {
    return "completed";
  }

  if (isOverdue(task.due_date, task.status)) {
    return "missing";
  }

  return task.status;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// =========================================================
// COLLABORATOR STATE
// =========================================================

let selectedTaskCollaborators = [];
let availableTaskCollaborators = [];

// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {
  const status = document.getElementById("filterStatus")?.value || "";

  const priority = document.getElementById("filterPriority")?.value || "";

  let url = "/tasks?page=1&limit=5";

  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }

  if (priority) {
    url += `&priority=${encodeURIComponent(priority)}`;
  }

  try {
    const res = await api(url);

    const tasks = res.data?.tasks || [];

    const list = document.getElementById("tasksList");

    if (!list) return;

    list.innerHTML = "";

    if (tasks.length === 0) {
      list.innerHTML = "<p>No tasks found.</p>";
      return;
    }

    tasks.forEach((task) => {
      const displayStatus = getDisplayStatus(task);

      const card = document.createElement("div");

      card.className = "task-card";

      card.innerHTML = `
        <div class="task-card-header">

          <div class="task-content">

            <h3>${escapeHtml(task.title)}</h3>

            <p class="task-description">${escapeHtml(
              task.description || "",
            )}</p>

            <div class="task-meta">

              <span class="badge badge-${escapeHtml(displayStatus)}">
                ${escapeHtml(displayStatus)}
              </span>

              <span class="badge badge-${escapeHtml(task.priority || "")}">
                ${escapeHtml(task.priority || "")}
              </span>

              <span
                class="task-due ${
                  isOverdue(task.due_date, task.status) ? "overdue" : ""
                }"
              >
                Due:
                ${
                  task.due_date ? new Date(task.due_date).toLocaleString() : "—"
                }
              </span>

            </div>

          </div>

          <div class="task-actions">

            <button
              type="button"
              class="btn-edit"
              data-id="${task.id}"
            >
              Edit
            </button>

            <button
              type="button"
              class="btn-delete"
              data-id="${task.id}"
            >
              Delete
            </button>

          </div>

        </div>
      `;

      // Clicking task content opens task detail
      card.querySelector(".task-content").addEventListener("click", () => {
        window.location.href = `task-detail.html?id=${task.id}`;
      });

      // Edit button
      card.querySelector(".btn-edit").addEventListener("click", (e) => {
        e.stopPropagation();

        openEditModal(task);
      });

      // Delete button
      card.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();

        deleteTask(task.id);
      });

      list.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load tasks:", err);

    alert(err.message);
  }
}

// =========================================================
// LOAD SHARED TASKS
// =========================================================

async function loadSharedTasks() {
  try {
    const res = await api("/tasks/shared-with-me");

    const tasks = res.data?.tasks || [];

    const list = document.getElementById("sharedTasksList");

    if (!list) return;

    list.innerHTML = "";

    if (tasks.length === 0) {
      list.innerHTML = "<p>No shared tasks yet.</p>";
      return;
    }

    tasks.forEach((task) => {
      const displayStatus = getDisplayStatus(task);

      const card = document.createElement("div");

      card.className = "task-card";

      card.innerHTML = `
        <div class="task-card-header">

          <div class="task-content">

            <h3>${escapeHtml(task.title)}</h3>

            <p class="task-description">${escapeHtml(
              task.description || "",
            )}</p>

            <div class="task-meta">

              <span class="badge badge-${escapeHtml(displayStatus)}">
                ${escapeHtml(displayStatus)}
              </span>

              <span class="badge badge-${escapeHtml(task.priority || "")}">
                ${escapeHtml(task.priority || "")}
              </span>

              <span
                class="task-due ${
                  isOverdue(task.due_date, task.status) ? "overdue" : ""
                }"
              >
                Due:
                ${
                  task.due_date ? new Date(task.due_date).toLocaleString() : "—"
                }
              </span>

            </div>

          </div>

        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `task-detail.html?id=${task.id}`;
      });

      list.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load shared tasks:", err);

    const list = document.getElementById("sharedTasksList");

    if (list) {
      list.innerHTML = "<p>Could not load shared tasks.</p>";
    }
  }
}

// =========================================================
// LOAD COLLABORATORS
// =========================================================

async function loadTaskCollaborators() {
  try {
    const res = await api("/collaboration/collaborators");

    availableTaskCollaborators = res.data?.collaborators || [];

    renderTaskCollaboratorPicker();
    renderSelectedTaskCollaborators();
  } catch (err) {
    console.error("Failed to load collaborators:", err);

    availableTaskCollaborators = [];
  }
}

function renderTaskCollaboratorPicker() {
  const picker = document.getElementById("taskCollaboratorPicker");

  if (!picker) return;

  if (availableTaskCollaborators.length === 0) {
    picker.innerHTML = `
      <p class="collaborator-empty">
        You don't have any accepted collaborators.
      </p>
    `;

    return;
  }

  picker.innerHTML = availableTaskCollaborators
    .map((collaborator) => {
      const selected = selectedTaskCollaborators.includes(collaborator.id);

      return `
          <label class="task-collaborator-option">

            <input
              type="checkbox"
              class="task-collaborator-checkbox"
              value="${collaborator.id}"
              ${selected ? "checked" : ""}
            />

            <div>

              <div class="collaborator-option-name">
                ${escapeHtml(collaborator.name || collaborator.email || "User")}
              </div>

              <div class="collaborator-option-email">
                ${escapeHtml(collaborator.email || "")}
              </div>

            </div>

          </label>
        `;
    })
    .join("");

  picker.querySelectorAll(".task-collaborator-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const userId = e.target.value;

      if (e.target.checked) {
        if (!selectedTaskCollaborators.includes(userId)) {
          selectedTaskCollaborators.push(userId);
        }
      } else {
        selectedTaskCollaborators = selectedTaskCollaborators.filter(
          (id) => id !== userId,
        );
      }

      renderSelectedTaskCollaborators();
    });
  });
}

function renderSelectedTaskCollaborators() {
  const container = document.getElementById("selectedTaskCollaborators");

  if (!container) return;

  if (selectedTaskCollaborators.length === 0) {
    container.innerHTML = `
      <span class="no-collaborators-selected">
        No collaborators selected.
      </span>
    `;

    return;
  }

  container.innerHTML = selectedTaskCollaborators
    .map((id) => {
      const collaborator = availableTaskCollaborators.find((c) => c.id === id);

      if (!collaborator) return "";

      return `
          <div class="selected-collaborator">

            <span>
              ${escapeHtml(collaborator.name || collaborator.email || "User")}
            </span>

            <button
              type="button"
              class="remove-selected-collaborator"
              data-id="${collaborator.id}"
            >
              ×
            </button>

          </div>
        `;
    })
    .join("");

  container
    .querySelectorAll(".remove-selected-collaborator")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const userId = button.dataset.id;

        selectedTaskCollaborators = selectedTaskCollaborators.filter(
          (id) => id !== userId,
        );

        renderSelectedTaskCollaborators();
        renderTaskCollaboratorPicker();
      });
    });
}

// =========================================================
// CREATE TASK MODAL
// =========================================================

function openModal() {
  selectedTaskCollaborators = [];

  renderSelectedTaskCollaborators();
  renderTaskCollaboratorPicker();

  const picker = document.getElementById("taskCollaboratorPicker");

  if (picker) {
    picker.style.display = "none";
  }

  document.getElementById("modal")?.classList.add("active");
}

function closeModal() {
  document.getElementById("modal")?.classList.remove("active");
}

// =========================================================
// COLLABORATOR PICKER TOGGLE
// =========================================================

document
  .getElementById("btnAddTaskCollaborator")
  ?.addEventListener("click", () => {
    const picker = document.getElementById("taskCollaboratorPicker");

    if (!picker) return;

    const isOpen = picker.style.display === "block";

    picker.style.display = isOpen ? "none" : "block";
  });

// =========================================================
// DATE / TIME
// =========================================================

const now = new Date();

const offset = now.getTimezoneOffset() * 60000;

const localISOTime = new Date(now - offset).toISOString();

const currentDateTime = localISOTime.slice(0, 16);

const dueDateInput = document.getElementById("due_date");

const reminderInput = document.getElementById("reminder_at");

const editDueDateInput = document.getElementById("editDueDate");

const editReminderInput = document.getElementById("editReminderAt");

if (dueDateInput) {
  dueDateInput.setAttribute("min", currentDateTime);
}

if (reminderInput) {
  reminderInput.setAttribute("min", currentDateTime);
}

if (editDueDateInput) {
  editDueDateInput.setAttribute("min", currentDateTime);
}

if (editReminderInput) {
  editReminderInput.setAttribute("min", currentDateTime);
}

const createForm = document.getElementById("createTaskForm");

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dueDateVal = document.getElementById("due_date").value;
    const reminderVal = document.getElementById("reminder_at").value;

    const body = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      status: "pending",
      priority: document.getElementById("priority").value,
      due_date: dueDateVal ? new Date(dueDateVal).toISOString() : undefined,

      reminder_at: reminderVal
        ? new Date(reminderVal).toISOString()
        : undefined,

      collaborator_ids: selectedTaskCollaborators,
    };

    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      closeModal();
      createForm.reset();
      selectedTaskCollaborators = [];
      renderSelectedTaskCollaborators();
      await loadTasks();
      await loadTaskCollaborators();
    } catch (err) {
      alert(err.message);
    }
  });
}

function toLocalInputValue(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

function openEditModal(task) {
  document.getElementById("editId").value = task.id;
  document.getElementById("editTitle").value = task.title || "";
  document.getElementById("editDescription").value = task.description || "";
  document.getElementById("editStatus").value = task.status || "pending";
  document.getElementById("editPriority").value = task.priority || "medium";
  document.getElementById("editDueDate").value = toLocalInputValue(
    task.due_date,
  );

  document.getElementById("editReminderAt").value = toLocalInputValue(
    task.reminder_at,
  );

  const completed = task.status === "completed";
  const dueInput = document.getElementById("editDueDate");
  const reminderInput = document.getElementById("editReminderAt");
  dueInput.disabled = completed;
  reminderInput.disabled = completed;

  document.getElementById("editModal")?.classList.add("active");
}

function closeEditModal() {
  document.getElementById("editModal")?.classList.remove("active");
}

document.getElementById("editStatus")?.addEventListener("change", (e) => {
  const completed = e.target.value === "completed";
  const dueInput = document.getElementById("editDueDate");
  const reminderInput = document.getElementById("editReminderAt");
  dueInput.disabled = completed;
  reminderInput.disabled = completed;

  if (!completed) {
    dueInput.setAttribute("min", currentDateTime);

    reminderInput.setAttribute("min", currentDateTime);
  } else {
    dueInput.removeAttribute("min");
    reminderInput.removeAttribute("min");
  }
});

const editForm = document.getElementById("editTaskForm");

if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const dueDateVal = document.getElementById("editDueDate").value;
    const reminderVal = document.getElementById("editReminderAt").value;

    const body = {
      title: document.getElementById("editTitle").value,
      description: document.getElementById("editDescription").value,
      status: document.getElementById("editStatus").value,
      priority: document.getElementById("editPriority").value,
      due_date: dueDateVal ? new Date(dueDateVal).toISOString() : null,
      reminder_at: reminderVal ? new Date(reminderVal).toISOString() : null,
    };

    try {
      await api(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      closeEditModal();

      await loadTasks();
    } catch (err) {
      console.error("Failed to update task:", err);

      alert(err.message);
    }
  });
}

async function deleteTask(id) {
  const confirmed = confirm("Are you sure you want to delete this task?");

  if (!confirmed) return;

  try {
    await api(`/tasks/${id}`, {
      method: "DELETE",
    });

    await loadTasks();
  } catch (err) {
    console.error("Failed to delete task:", err);

    alert(err.message);
  }
}

document.getElementById("btnFilter")?.addEventListener("click", loadTasks);
document.getElementById("btnOpenModal")?.addEventListener("click", openModal);
document.getElementById("btnCloseModal")?.addEventListener("click", closeModal);

document
  .getElementById("btnCloseEditModal")
  ?.addEventListener("click", closeEditModal);

loadTasks();
loadSharedTasks();
loadTaskCollaborators();

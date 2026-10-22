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
let taskItems = [];
let modalTrigger = null;
let activeTaskView = "all";
let currentTaskPage = 1;

// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {
  const list = document.getElementById("tasksList");
  const notice = document.getElementById("taskNotice");
  if (!list) return;

  list.setAttribute("aria-busy", "true");
  list.innerHTML = '<p class="task-list-state">Loading your tasks...</p>';
  if (notice) notice.textContent = "";

  try {
    const res = await api("/tasks?page=1&limit=100");
    taskItems = res.data?.tasks || [];
    updateTaskSummary(taskItems);
    renderTasks();
  } catch (err) {
    console.error("Failed to load tasks:", err);
    list.innerHTML = '<p class="task-list-state task-list-error">Could not load tasks. Try again.</p>';
    if (notice) notice.textContent = err.message || "Task loading failed.";
    const results = document.getElementById("taskResults");
    if (results) results.textContent = "Tasks unavailable";
  } finally {
    list.setAttribute("aria-busy", "false");
  }
}

function updateTaskSummary(tasks) {
  const openCount = tasks.filter((task) => task.status !== "completed").length;
  const completedCount = tasks.length - openCount;
  const soonLimit = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const dueSoonCount = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") return false;
    const dueTime = new Date(task.due_date).getTime();
    return dueTime >= Date.now() && dueTime <= soonLimit;
  }).length;

  document.getElementById("summaryOpen")?.replaceChildren(String(openCount));
  document.getElementById("summaryDueSoon")?.replaceChildren(String(dueSoonCount));
  document.getElementById("summaryCompleted")?.replaceChildren(String(completedCount));
}

function renderTasks() {
  const list = document.getElementById("tasksList");
  if (!list) return;

  const search = (document.getElementById("taskSearch")?.value || "")
    .trim()
    .toLocaleLowerCase();
  const statusFilter = document.getElementById("filterStatus")?.value || "";
  const priorityFilter = document.getElementById("filterPriority")?.value || "";
  const sortBy = document.getElementById("sortTasks")?.value || "due";
  const now = Date.now();
  const dueSoonLimit = now + 7 * 24 * 60 * 60 * 1000;
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const visibleTasks = taskItems
    .filter((task) => {
      const displayStatus = getDisplayStatus(task);
      const searchable = `${task.title || ""} ${task.description || ""}`.toLocaleLowerCase();
      return (!search || searchable.includes(search)) &&
        (!statusFilter || displayStatus === statusFilter) &&
        (!priorityFilter || task.priority === priorityFilter) &&
        (activeTaskView !== "open" || task.status !== "completed") &&
        (activeTaskView !== "completed" || task.status === "completed") &&
        (activeTaskView !== "due-soon" || (task.due_date && task.status !== "completed" &&
          new Date(task.due_date).getTime() >= now && new Date(task.due_date).getTime() <= dueSoonLimit));
    })
    .sort((left, right) => {
      if (sortBy === "priority") {
        return (priorityRank[right.priority] || 0) - (priorityRank[left.priority] || 0);
      }
      if (sortBy === "newest") {
        return new Date(right.created_at || 0) - new Date(left.created_at || 0);
      }
      if (sortBy === "title") {
        return (left.title || "").localeCompare(right.title || "");
      }
      const leftDue = left.due_date ? new Date(left.due_date).getTime() : Infinity;
      const rightDue = right.due_date ? new Date(right.due_date).getTime() : Infinity;
      return leftDue - rightDue;
    });

  const results = document.getElementById("taskResults");
  if (visibleTasks.length === 0) {
    const hasFilters = Boolean(search || statusFilter || priorityFilter || activeTaskView !== "all");
    const pagination = document.getElementById("taskPagination");
    if (pagination) pagination.hidden = true;
    if (results) results.textContent = `0 tasks${taskItems.length ? ` of ${taskItems.length}` : ""}`;
    list.innerHTML = hasFilters
      ? '<div class="task-list-state"><strong>No matching tasks</strong><span>Try a different search or clear your filters.</span><button id="emptyClearFilters" type="button" class="secondary-btn">Clear filters</button></div>'
      : '<div class="task-list-state"><strong>Your task list is clear</strong><span>Create a task to plan the next thing that needs doing.</span><button id="emptyCreateTask" type="button">+ Create your first task</button></div>';
    document.getElementById("emptyClearFilters")?.addEventListener("click", clearTaskFilters);
    document.getElementById("emptyCreateTask")?.addEventListener("click", openModal);
    return;
  }

  const pageSize = Number(document.getElementById("taskPageSize")?.value || 10);
  const pageCount = Math.ceil(visibleTasks.length / pageSize);
  currentTaskPage = Math.min(currentTaskPage, pageCount);
  const startIndex = (currentTaskPage - 1) * pageSize;
  const pageTasks = visibleTasks.slice(startIndex, startIndex + pageSize);
  const pagination = document.getElementById("taskPagination");
  const previousButton = document.getElementById("btnPreviousPage");
  const nextButton = document.getElementById("btnNextPage");
  const pageLabel = document.getElementById("taskPageLabel");
  if (pagination) pagination.hidden = visibleTasks.length <= pageSize;
  if (previousButton) previousButton.disabled = currentTaskPage <= 1;
  if (nextButton) nextButton.disabled = currentTaskPage >= pageCount;
  if (pageLabel) pageLabel.textContent = `Page ${currentTaskPage} of ${pageCount}`;
  if (results) {
    results.textContent = `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, visibleTasks.length)} of ${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  }

  list.innerHTML = "";
  pageTasks.forEach((task) => {
      const displayStatus = getDisplayStatus(task);
      const card = document.createElement("div");
      card.className = "task-card";
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", "Open task");
      card.innerHTML = `
        <div class="task-card-header">
          <div class="task-content">
            <div class="task-title-row">
              <h3>${escapeHtml(task.title || "Untitled task")}</h3>
              <span class="badge badge-${escapeHtml(task.priority || "medium")}">${escapeHtml(task.priority || "medium")} priority</span>
            </div>
            <p class="task-description">${escapeHtml(
              task.description || "No description added.",
            )}</p>
            <div class="task-meta">
              <span class="badge badge-${escapeHtml(displayStatus)}">
                ${escapeHtml(displayStatus.replace("_", " "))}
              </span>
              <span
                class="task-due ${
                  isOverdue(task.due_date, task.status) ? "overdue" : ""
                }"
              >
                ${task.due_date ? `Due ${escapeHtml(new Date(task.due_date).toLocaleString())}` : "No due date"}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button
              type="button"
              class="btn-edit"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn-delete"
            >
              Delete
            </button>
          </div>
        </div>
      `;
      card.setAttribute("aria-label", `Open task: ${task.title || "Untitled task"}`);
      const openTask = () => {
        window.location.href = `task-detail.html?id=${encodeURIComponent(task.id)}`;
      };
      card.querySelector(".btn-edit").setAttribute("aria-label", `Edit ${task.title || "task"}`);
      card.querySelector(".btn-delete").setAttribute("aria-label", `Delete ${task.title || "task"}`);
      card.addEventListener("click", openTask);
      card.addEventListener("keydown", (event) => {
        if (event.target !== card) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openTask();
        }
      });
      card.querySelector(".btn-edit").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(task);
      });
      card.querySelector(".btn-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });
      list.appendChild(card);
  });
}



async function loadAdminTasks() {
  try {
    const response = await api("/tasks/assigned-by-admin");

    console.log("Admin tasks response:", response);

    const tasks =
      response.data?.data?.tasks ??
      response.data?.tasks ??
      response.data ??
      [];

    const container = document.getElementById("adminTasksList");

    if (!container) {
      console.error("Element #adminTasksList not found");
      return;
    }

    container.innerHTML = "";

    if (!Array.isArray(tasks) || tasks.length === 0) {
      container.innerHTML = "<p>No tasks assigned by admin yet.</p>";
      return;
    }

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";

      const displayStatus = getDisplayStatus(task);

      card.innerHTML = `
        <div class="task-card-header">
          <div class="task-content">
            <h3>${escapeHtml(task.title)}</h3>
            <p class="task-description">
              ${escapeHtml(task.description || "")}
            </p>
            <div class="task-meta">
              <span class="badge badge-${escapeHtml(displayStatus)}">
                ${escapeHtml(displayStatus)}
              </span>
              <span class="badge badge-${escapeHtml(task.priority || "")}">
                ${escapeHtml(task.priority || "")}
              </span>
              <span class="task-due">
                Due: ${
                  task.due_date
                    ? new Date(task.due_date).toLocaleString()
                    : "—"
                }
              </span>
            </div>
          </div>
        </div>
      `;

      card.querySelector(".task-content").addEventListener("click", () => {
        window.location.href = `task-detail.html?id=${task.id}`;
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load admin-assigned tasks:", error);
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
  modalTrigger = document.activeElement;
  document.getElementById("createTaskForm")?.reset();
  document.getElementById("title")?.setCustomValidity("");
  document.getElementById("description")?.setCustomValidity("");
  updateTaskFieldCounters();
  const notice = document.getElementById("createTaskNotice");
  if (notice) notice.textContent = "";
  selectedTaskCollaborators = [];

  renderSelectedTaskCollaborators();
  renderTaskCollaboratorPicker();

  const picker = document.getElementById("taskCollaboratorPicker");

  if (picker) {
    picker.style.display = "none";
  }

  document.getElementById("modal")?.classList.add("active");
  document.getElementById("title")?.focus();
}

function closeModal() {
  document.getElementById("modal")?.classList.remove("active");
  modalTrigger?.focus?.();
}

function clearTaskFilters() {
  document.getElementById("taskSearch").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterPriority").value = "";
  document.getElementById("sortTasks").value = "due";
  activeTaskView = "all";
  document.querySelectorAll(".quick-view").forEach((button) => {
    const active = button.dataset.view === "all";
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  currentTaskPage = 1;
  renderTasks();
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

function updateTaskFieldCounters() {
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const titleCounter = document.getElementById("titleCounter");
  const descriptionCounter = document.getElementById("descriptionCounter");
  if (titleCounter && title) titleCounter.textContent = `${title.value.length} / 20`;
  if (descriptionCounter && description) {
    const length = description.value.trim().length;
    descriptionCounter.textContent = length > 0 && length < 20
      ? `${length} / 100 (minimum 20)`
      : `${length} / 100`;
    descriptionCounter.classList.toggle("is-invalid", length > 0 && length < 20);
  }
}

document.getElementById("title")?.addEventListener("input", updateTaskFieldCounters);
document.getElementById("description")?.addEventListener("input", updateTaskFieldCounters);
document.getElementById("title")?.addEventListener("input", (event) => {
  event.target.setCustomValidity(event.target.value.trim() ? "" : "Enter a task title.");
});
document.getElementById("description")?.addEventListener("input", (event) => {
  const length = event.target.value.trim().length;
  event.target.setCustomValidity(length === 0 || length >= 20
    ? ""
    : "Enter at least 20 characters, or leave the description blank.");
});
updateTaskFieldCounters();

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dueDateVal = document.getElementById("due_date").value;
    const reminderVal = document.getElementById("reminder_at").value;
    const notice = document.getElementById("createTaskNotice");
    const submitButton = document.getElementById("btnCreateTask");
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!title || title.length > 20) {
      if (notice) notice.textContent = "Enter a task title with 1 to 20 characters.";
      document.getElementById("title").focus();
      return;
    }
    if (description && (description.length < 20 || description.length > 100)) {
      if (notice) notice.textContent = "A description must be blank or between 20 and 100 characters.";
      document.getElementById("description").focus();
      return;
    }

    if (dueDateVal && reminderVal && new Date(reminderVal) > new Date(dueDateVal)) {
      if (notice) notice.textContent = "The reminder must be before the due date.";
      document.getElementById("reminder_at").focus();
      return;
    }

    const body = {
      title,
      description: description || undefined,
      status: "pending",
      priority: document.getElementById("priority").value,
      due_date: dueDateVal ? new Date(dueDateVal).toISOString() : undefined,

      reminder_at: reminderVal
        ? new Date(reminderVal).toISOString()
        : undefined,

      collaborator_ids: selectedTaskCollaborators,
    };

    try {
      if (notice) notice.textContent = "Creating your task...";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Creating...";
      }
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });
      closeModal();
      createForm.reset();
      selectedTaskCollaborators = [];
      currentTaskPage = 1;
      renderSelectedTaskCollaborators();
      await loadTasks();
      await loadTaskCollaborators();
      const taskNotice = document.getElementById("taskNotice");
      if (taskNotice) taskNotice.textContent = "Task created successfully.";
    } catch (err) {
      if (notice) notice.textContent = err.message || "Could not create this task.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Create task";
      }
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
  modalTrigger = document.activeElement;
  const editNotice = document.getElementById("editTaskNotice");
  if (editNotice) editNotice.textContent = "";
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
  document.getElementById("editTitle")?.focus();
}

function closeEditModal() {
  document.getElementById("editModal")?.classList.remove("active");
  modalTrigger?.focus?.();
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
    const submitButton = editForm.querySelector('button[type="submit"]');
    const editTitle = document.getElementById("editTitle").value.trim();
    const editDescription = document.getElementById("editDescription").value.trim();

    if (!editTitle || editTitle.length > 20) {
      const notice = document.getElementById("editTaskNotice");
      if (notice) notice.textContent = "Enter a task title with 1 to 20 characters.";
      document.getElementById("editTitle").focus();
      return;
    }
    if (editDescription && (editDescription.length < 20 || editDescription.length > 100)) {
      const notice = document.getElementById("editTaskNotice");
      if (notice) notice.textContent = "A description must be blank or between 20 and 100 characters.";
      document.getElementById("editDescription").focus();
      return;
    }

    if (dueDateVal && reminderVal && new Date(reminderVal) > new Date(dueDateVal)) {
      const notice = document.getElementById("editTaskNotice");
      if (notice) notice.textContent = "The reminder must be before the due date.";
      document.getElementById("editReminderAt").focus();
      return;
    }

    const body = {
      title: editTitle,
      description: editDescription || undefined,
      status: document.getElementById("editStatus").value,
      priority: document.getElementById("editPriority").value,
      due_date: dueDateVal ? new Date(dueDateVal).toISOString() : null,
      reminder_at: reminderVal ? new Date(reminderVal).toISOString() : null,
    };

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Saving...";
      }
      await api(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      closeEditModal();

      await loadTasks();
    } catch (err) {
      console.error("Failed to update task:", err);

      const notice = document.getElementById("editTaskNotice");
      if (notice) notice.textContent = err.message || "Could not update this task.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Update task";
      }
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

document.getElementById("btnFilter")?.addEventListener("click", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.getElementById("btnClearFilters")?.addEventListener("click", clearTaskFilters);
document.getElementById("taskSearch")?.addEventListener("input", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.getElementById("filterStatus")?.addEventListener("change", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.getElementById("filterPriority")?.addEventListener("change", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.getElementById("sortTasks")?.addEventListener("change", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.querySelectorAll(".quick-view").forEach((button) => {
  button.addEventListener("click", () => {
    activeTaskView = button.dataset.view || "all";
    currentTaskPage = 1;
    document.querySelectorAll(".quick-view").forEach((viewButton) => {
      const active = viewButton === button;
      viewButton.classList.toggle("active", active);
      viewButton.setAttribute("aria-pressed", String(active));
    });
    renderTasks();
  });
});
document.getElementById("taskPageSize")?.addEventListener("change", () => {
  currentTaskPage = 1;
  renderTasks();
});
document.getElementById("btnPreviousPage")?.addEventListener("click", () => {
  currentTaskPage = Math.max(1, currentTaskPage - 1);
  renderTasks();
});
document.getElementById("btnNextPage")?.addEventListener("click", () => {
  currentTaskPage += 1;
  renderTasks();
});
document.getElementById("btnOpenModal")?.addEventListener("click", openModal);
document.getElementById("btnCloseModal")?.addEventListener("click", closeModal);

document
  .getElementById("btnCloseEditModal")
  ?.addEventListener("click", closeEditModal);

document.getElementById("modal")?.addEventListener("click", (event) => {
  if (event.target.id === "modal") closeModal();
});

document.getElementById("editModal")?.addEventListener("click", (event) => {
  if (event.target.id === "editModal") closeEditModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (document.getElementById("editModal")?.classList.contains("active")) {
    closeEditModal();
  } else if (document.getElementById("modal")?.classList.contains("active")) {
    closeModal();
  }
});

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "dashboard.html") {
  loadTasks();
  loadTaskCollaborators();
} else if (currentPage === "admin-tasks.html") {
  loadAdminTasks();
} else if (currentPage === "shared-tasks.html") {
  loadSharedTasks();
}

console.log("Current page:", window.location.pathname);
console.log("loadAdminTasks exists:", typeof loadAdminTasks);
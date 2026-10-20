const params = new URLSearchParams(window.location.search);
const taskId = params.get("id");
let currentUserId = null;
let currentTask = null;
let taskCollaborators = [];
let availableCollaborators = [];

function isOverdue(dueDate, status) {
  if (!dueDate || status === "completed") {
    return false;
  }

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

function formatMsgTime(dateStr) {
  const d = new Date(dateStr);

  const datePart = d.toLocaleDateString("en-US", {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
  });

  const timePart = d.toLocaleTimeString();
  return `${datePart}, ${timePart}`;
}

async function initTaskDetail() {
  if (!taskId) {
    window.location.href = "dashboard.html";

    return;
  }

  try {
    const meRes = await api("/auth/me");
    currentUserId = meRes.data.id;
  } catch (err) {
    logout();
    return;
  }


  try {
    const res = await api(`/tasks/${taskId}`);
    currentTask = res.data.task;
    const displayStatus = getDisplayStatus(currentTask)

    // Only owner can manage
    // task collaborators.
    // if (currentUserId !== currentTask.owner_id) {
    //   const collabSection = document.getElementById("collabSection");
    //   if (collabSection) {
    //     collabSection.style.display = "none";
    //   }
    // }

    if (currentUserId !== currentTask.owner_id) {
      const addButton = document.getElementById("btnAddCollaborator");
      const picker = document.getElementById("collaboratorPicker");
      if (addButton) {
        addButton.style.display = "none";
      }
      if (picker) {
        picker.style.display = "none";
      }
    }
    document.getElementById("taskInfo").innerHTML = `

      <h1>
        ${escapeHtml(currentTask.title)}
      </h1>

      <p>
        ${escapeHtml(currentTask.description || "")}
      </p>

      <div class="task-meta">

        <span
          class="badge badge-${displayStatus}"
        >
          ${displayStatus}
        </span>

        <span
          class="badge badge-${currentTask.priority}"
        >
          ${currentTask.priority}
        </span>

        <span>
          Due:
          ${
            currentTask.due_date
              ? new Date(currentTask.due_date).toLocaleString()
              : "—"
          }
        </span>

      </div>

    `;
  } catch (err) {
    alert(err.message);

    return;
  }

  await loadCollaborators();

  await loadAvailableCollaborators();
  setupLeaveTask();
  loadMessages();

  initChat(taskId);
}

// Load task collaborators

async function loadCollaborators() {
  try {
    const res = await api(`/tasks/${taskId}/collaborators`);

    taskCollaborators = res.data?.collaborators || [];

    const list = document.getElementById("collaborators");

    if (taskCollaborators.length === 0) {
      list.innerHTML = '<p class="collaboration-empty-state">No collaborators yet.</p>';

      return;
    }

    list.innerHTML = taskCollaborators
      .map((c) => {
        const name = c.name || c.email || c.id;

        return `
            <div class="collaborator-card">
              <div class="collaborator-info">
                <div class="collaborator-avatar">
                  ${escapeHtml(name.charAt(0)).toUpperCase()}
                </div>
                <div class="collaborator-details">
                  <div class="collaborator-name">${escapeHtml(name)}</div>
                  <div class="collaborator-email">${escapeHtml(c.email || "")}</div>
                </div>
              </div>
              <button class="btn-remove-collab" data-userid="${c.id}" type="button">
                Remove
              </button>

            </div>

          `;
      })
      .join("");

    list.querySelectorAll(".btn-remove-collab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const userId = btn.dataset.userid;

        removeCollab(userId);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

// Load accepted global collaborators

async function loadAvailableCollaborators() {
  try {
    const res = await api("/collaboration/collaborators");

    availableCollaborators = res.data?.collaborators || [];

    renderCollaboratorPicker();
  } catch (err) {
    console.error("Could not load available collaborators:", err);
  }
}

// Render collaborator picker

function renderCollaboratorPicker() {
  const picker = document.getElementById("collaboratorPicker");

  if (!picker) return;

  const existingIds = taskCollaborators.map((c) => c.id);

  const available = availableCollaborators.filter(
    (c) => !existingIds.includes(c.id),
  );

  if (available.length === 0) {
    picker.innerHTML = '<p class="collaborator-empty">All collaborators are already on this task.</p>';

    return;
  }

  picker.innerHTML = available
    .map(
      (c) => `

        <label class="task-collaborator-option">

          <input
            type="radio"
            name="taskCollaborator"
            value="${c.id}"
          />

          <div>

            <div class="collaborator-option-name">
              ${escapeHtml(c.name || c.email)}
            </div>

            <div class="collaborator-option-email">
              ${escapeHtml(c.email || "")}
            </div>

          </div>

        </label>

      `,
    )
    .join("");

  picker.querySelectorAll('input[name="taskCollaborator"]').forEach((input) => {
    input.addEventListener("change", async () => {
      const userId = input.value;

      await addCollaborator(userId);
    });
  });
}

// 
// Open collaborator picker
// 

document.getElementById("btnAddCollaborator")?.addEventListener("click", () => {
  const picker = document.getElementById("collaboratorPicker");

  if (!picker) return;

  const isOpen = picker.style.display === "block";

  picker.style.display = isOpen ? "none" : "block";
});

// Add collaborator to task

async function addCollaborator(userId) {
  try {
    await api(`/tasks/${taskId}/collaborators`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    // Close picker

    const picker = document.getElementById("collaboratorPicker");

    if (picker) {
      picker.style.display = "none";
    }

    // Reload both lists

    await loadCollaborators();

    await loadAvailableCollaborators();
  } catch (err) {
    alert(err.message);

    renderCollaboratorPicker();
  }
}

// Remove collaborator

async function removeCollab(userId) {
  if (!confirm("Remove this collaborator?")) {
    return;
  }

  try {
    await api(`/tasks/${taskId}/collaborators/${userId}`, {
      method: "DELETE",
    });

    await loadCollaborators();

    await loadAvailableCollaborators();
  } catch (err) {
    alert(err.message);
  }
}

// Leave Task

function setupLeaveTask() {
  const button = document.getElementById("btnLeaveTask");

  if (!button) return;

  // Owner cannot leave their own task
  if (currentUserId === currentTask.owner_id) {
    return;
  }

  // Show leave button only if current user is a collaborator
  const isCollaborator = taskCollaborators.some(
    (collaborator) => collaborator.id === currentUserId,
  );

  if (!isCollaborator) {
    return;
  }
  button.style.display = "inline-block";
  button.addEventListener("click", leaveCurrentTask);
}

async function leaveCurrentTask() {
  if (!confirm("Are you sure you want to leave this task?")) {
    return;
  }

  try {
    await api(`/tasks/${taskId}/leave`, {
      method: "DELETE",
    });

    alert("You left the task successfully.");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
}

async function loadMessages() {
  try {
    const res = await api(`/tasks/${taskId}/messages?page=1&limit=50`);
    const msgs = res.data.message;
    const box = document.getElementById("chatMessages");
    box.innerHTML = msgs.map((m) => renderMsg(m)).join("");
    box.scrollTop = box.scrollHeight;
  } catch (err) {
    console.error(err);
  }
}

function renderMsg(m) {
  const sender = m.sender_name || "Unknown";

  return `
    <div class="msg">
      <strong>
        ${escapeHtml(sender)}
      </strong>
      <time>
        ${m.created_at ? formatMsgTime(m.created_at) : ""}
      </time>
      <p>
        ${escapeHtml(m.body)}
      </p>
      ${
        m.image_url? `<img
               src="${escapeHtml(m.image_url)}"
               alt="attachment"
               class="chat-image"
             >`
          : ""
      }

    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
document.getElementById("btnLogout")?.addEventListener("click", logout);

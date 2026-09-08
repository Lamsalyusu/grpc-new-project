import { findDueReminders, markReminderAsSent } from "../repositories/reminderRepository";
import { findAllByTask } from "../repositories/taskCollaboratorRepository";
import { createNotification } from "../service/notificationService";

async function processReminder() {
  const dueReminders = await findDueReminders();
  if (!dueReminders || dueReminders.length === 0) {
    return [];
  }

  const firedReminders = [];

  for (const reminder of dueReminders) {
    const payload = {
      task_id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      due_date: reminder.due_date,
    };

    await createNotification(reminder.owner_id, 'reminder', payload);

    const collaborators = await findAllByTask(reminder.id);
    for (const collab of collaborators) {
      await createNotification(collab.user_id, 'reminder', payload);
    }

    await markReminderAsSent(reminder.id);

    firedReminders.push({ owner_id: reminder.owner_id, payload });
  }

  return firedReminders;
}

export default processReminder;
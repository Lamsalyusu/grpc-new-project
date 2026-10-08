import {QueryTypes} from "sequelize";
import { Task, TaskCollaborator, User } from "../db/models/index";
import sequelize from "../db/connection";

type taskCollaborator = {
  task_id:string,
  user_id:string
}


//--> is this specific person a collaborator on this specific task
async function findOne(task_id: string, user_id: string) {
  // return TaskCollaborator.findOne({ where: { task_id, user_id } });
  const result = await sequelize.query(
    "SELECT * FROM task_collaborators WHERE task_id = ? AND user_id = ?",
    {
      replacements: [task_id, user_id],
      type: QueryTypes.SELECT,
    }
  );
  return result[0]||null;
}

// --> who are the collaborators on this task
async function findAllByTask(task_id: string) {
  return TaskCollaborator.findAll({
    where: { task_id },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });
}

async function addCollaborator(task_id: string, user_id: string) {
  // return TaskCollaborator.create({ user_id, task_id });
  await sequelize.query(
    "INSERT INTO task_collaborators (task_id, user_id,created_at) VALUES (?, ?, NOW())",
    {
      replacements: [task_id, user_id],
      type: QueryTypes.INSERT,
    }
  );
  const result = await sequelize.query(
    'SELECT task_id, user_id,created_at FROM task_collaborators WHERE task_id = ? AND user_id = ?',
    {
      replacements: [task_id, user_id],
      type: QueryTypes.SELECT,
    }
  );
  return result[0]||null;
}

async function remove(task_id: string, user_id: string) {
  // return TaskCollaborator.destroy({ where: { task_id, user_id } });
await sequelize.query(
    "DELETE FROM task_collaborators WHERE task_id = ? AND user_id = ?",
    {
      replacements: [task_id, user_id],
      type: QueryTypes.DELETE,
    }
  );
  // return result;
}

// taskCollaboratorRepository.ts — add this
async function findTasksForUser(user_id: string) {
  return TaskCollaborator.findAll({
    where: { user_id },
    include: [
      {
        model: Task,
        as: "task",
        attributes: [
          "id",
          "title",
          "description",
          "status",
          "priority",
          "owner_id",
          "due_date",
          "reminder_at",
        ],
      },
    ], // requires the ser,Task↔TaskCollaborator association
  });
}

async function leaveTask(task_id: string, user_id: string) {
  // const leave_task = await TaskCollaborator.destroy({
  //   where: {
  //     task_id,
  //     user_id,
  //   },
  // });
await sequelize.query(
    "DELETE FROM task_collaborators WHERE task_id = ? AND user_id = ?",
    {
      replacements: [task_id, user_id],
      type: QueryTypes.DELETE,
    }
  );
  // return leave_task;
}

// }
export {
  findOne,
  findAllByTask,
  addCollaborator,
  remove,
  findTasksForUser,
  leaveTask,
};

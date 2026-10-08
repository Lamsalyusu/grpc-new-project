import { EnumDataType, Op } from "sequelize";
import { Task } from "../db/models/index";
import { Taskrequire } from "../validators/taskValidator";
import sequelize from "../db/connection";
import { QueryTypes } from "sequelize";

interface TaskFilters {
  status?: string;
  priority?: string;
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
}

type taskRow = {
  id:string,
  owner_id:string,
  title:string,
  description:string,
  status:string,
  priority:string,
  due_date:Date
  reminder_at:Date
  reminder_status:string
}

async function findById(id: string) {
  // return Task.findByPk(id);
  const tasks = await sequelize.query<taskRow>(
    "SELECT * FROM tasks where id = ? LIMIT 1",
    {
      replacements: [id],
      type: QueryTypes.SELECT
    }
  );
  console.log("task ko la yo chai" ,tasks);
  return tasks[0]||null;
}

async function findByOwner(owner_id: string, filters: TaskFilters) {
  const { status, priority, page, limit, sortBy, order } = filters;

  const where: any = { owner_id };
 
  if (status === 'missing') {
  where.status = { [Op.in]: ['pending', 'in_progress'] };
  where.due_date = { [Op.lt]: new Date() };
  } else if (status === 'pending') {
    where.status = 'pending';
    where.due_date = { [Op.or]: [{ [Op.gt]: new Date() }, { [Op.is]: null }] };
  } else if (status === 'in_progress') {
    where.status = 'in_progress';
    where.due_date = { [Op.or]: [{ [Op.gt]: new Date() }, { [Op.is]: null }] };
  } else if (status) {
    where.status = status;
  }
  
  if (priority) where.priority = priority;

  const offset = (page - 1) * limit;

  return Task.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, order.toUpperCase()]],
  });
}

async function create(data: Taskrequire) {
  return Task.create(data);
}

async function update(id: string, data: Taskrequire) {
  const task = await Task.findByPk(id);
  if (!task) return null;
  return task.update(data);
}

async function remove(id: string) {
  const task = await Task.findByPk(id);
  if (!task) return null;
  // await task.destroy();</taskRow>
  // return task;
  await sequelize.query(
    "DELETE FROM tasks WHERE id = ?",
    {
      replacements: [id],
      type: QueryTypes.DELETE
    }
  )
}

export { findById, findByOwner, create, update, remove };
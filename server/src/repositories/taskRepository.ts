import { Op } from "sequelize/lib/operators";
import { Task } from "../db/models/index";
import { taskqueryschema, Taskrequire } from "../validators/taskValidator";

interface TaskFilters {
  status?: string;
  priority?: string;
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
}

async function findById(id: string) {
  return Task.findByPk(id);
}

async function findByOwner(owner_id: string, filters: TaskFilters) {
  const { status, priority, page, limit, sortBy, order } = filters;

  const where: any = { owner_id };
  if (status === 'missing') {
  where.status = { [Op.in]: ['pending', 'in_progress'] };
  where.due_date = { [Op.lt]: new Date() };
    } else if (status) {
      where.status = status;
    }
  
  if (status === 'pending') {
  where.status = 'pending';
  where.due_date = { [Op.or]: [{ [Op.gt]: new Date() }, { [Op.is]: null }] };
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

async function create(data: any) {
  return Task.create(data);
}

async function update(id: string, data: any) {
  const task = await Task.findByPk(id);
  if (!task) return null;
  return task.update(data);
}

async function remove(id: string) {
  const task = await Task.findByPk(id);
  if (!task) return null;
  await task.destroy();
  return task;
}

export { findById, findByOwner, create, update, remove };
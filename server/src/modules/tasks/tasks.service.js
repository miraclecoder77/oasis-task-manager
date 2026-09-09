import prisma from '../../lib/prisma.js';

/**
 * Every function here takes userId first and puts it in the where clause.
 * There is deliberately no way to reach a task without one — a task owned by
 * someone else is indistinguishable from a task that does not exist.
 */

export const findAll = (userId, filters = {}) =>
  prisma.task.findMany({
    where: { userId, ...filters },
    orderBy: { createdAt: 'desc' },
  });

export const findOne = (userId, id) =>
  prisma.task.findFirst({ where: { id, userId } });

export const create = (userId, data) =>
  prisma.task.create({ data: { ...data, userId } });

export const update = async (userId, id, data) => {
  const existing = await findOne(userId, id);
  if (!existing) return null;

  return prisma.task.update({ where: { id }, data });
};


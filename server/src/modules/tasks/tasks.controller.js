import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import * as tasksService from './tasks.service.js';

// Ownership always comes from the verified token, never from the request.
const ownerId = (req) => req.user.id;

export const list = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filters = status ? { status } : {};
  const tasks = await tasksService.findAll(ownerId(req), filters);

  res.status(200).json({ data: tasks });
});

export const get = asyncHandler(async (req, res) => {
  const task = await tasksService.findOne(ownerId(req), req.params.id);
  if (!task) throw ApiError.notFound('Task not found');

  res.status(200).json({ data: task });
});

export const create = asyncHandler(async (req, res) => {
  const task = await tasksService.create(ownerId(req), req.body);

  res.status(201).json({ data: task });
});

export const update = asyncHandler(async (req, res) => {
  const task = await tasksService.update(ownerId(req), req.params.id, req.body);
  if (!task) throw ApiError.notFound('Task not found');

  res.status(200).json({ data: task });
});

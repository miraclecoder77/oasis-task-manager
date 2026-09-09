import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from './tasks.schema.js';
import * as tasksController from './tasks.controller.js';

const router = Router();

// No task route is reachable without a verified req.user.
router.use(authenticate);

router.get('/', validate(taskQuerySchema, 'query'), tasksController.list);
router.post('/', validate(createTaskSchema), tasksController.create);
router.get('/:id', tasksController.get);
router.patch('/:id', validate(updateTaskSchema), tasksController.update);

export default router;

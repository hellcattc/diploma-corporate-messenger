import { AppDataSource } from '../../config/ormconfig';
import { Task } from './task.entity';

export const TaskRepository = AppDataSource.getRepository(Task);
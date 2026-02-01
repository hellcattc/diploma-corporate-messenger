import { AppDataSource } from '../../config/ormconfig';
import { User } from './user.entity';

export const UserRepository = AppDataSource.getRepository(User);
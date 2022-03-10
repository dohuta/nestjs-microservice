import { User } from 'libs/database/src/model/entities/User';
import { IUser } from './user.interface';

export interface IUserSearchResponse {
  status: number;
  message: string;
  user: IUser | User | null;
}

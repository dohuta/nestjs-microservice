import { User } from 'libs/database/src/model/entities';
import { IUser } from './user.interface';

export interface IUserCreateResponse {
  status: number;
  message: string;
  user: IUser | User | null;
  errors: { [key: string]: any } | null;
}

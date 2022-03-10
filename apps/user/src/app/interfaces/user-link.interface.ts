import { Document } from 'mongoose';

export interface IUserLink extends Document {
  id?: string;
  user_id: number;
  link: string;
  is_used: boolean;
}

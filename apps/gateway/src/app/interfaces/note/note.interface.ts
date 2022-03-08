import { Document } from 'mongoose';

export interface INote extends Document {
  name: string;
  content: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

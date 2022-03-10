export interface INote {
  id: number;
  name: string;
  content: string;
  user_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface INoteCreate {
  name: string;
  content: string;
  user_id: number;
}

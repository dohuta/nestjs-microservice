import { INote } from './note.interface';

export interface INoteCreateResponse {
  status: number;
  message: string;
  note: INote | null;
  errors: { [key: string]: any } | null;
}

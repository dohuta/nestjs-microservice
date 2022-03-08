import { INote } from './note.interface';

export interface INoteUpdateByIdResponse {
  status: number;
  message: string;
  note: INote | null;
  errors: { [key: string]: any } | null;
}

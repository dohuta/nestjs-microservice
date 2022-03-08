import { INote } from './note.interface';

export interface IServiceNoteUpdateByIdResponse {
  status: number;
  message: string;
  note: INote | null;
  errors: { [key: string]: any };
}

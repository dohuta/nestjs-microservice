import { INote } from './note.interface';

export interface IServiceNoteCreateResponse {
  status: number;
  message: string;
  note: INote | null;
  errors: { [key: string]: any };
}

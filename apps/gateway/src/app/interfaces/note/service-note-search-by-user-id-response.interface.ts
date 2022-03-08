import { INote } from './note.interface';

export interface IServiceNoteSearchByUserIdResponse {
  status: number;
  message: string;
  notes: INote[];
}

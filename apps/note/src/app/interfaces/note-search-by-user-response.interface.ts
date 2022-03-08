import { INote } from './note.interface';

export interface INoteSearchByUserResponse {
  status: number;
  message: string;
  notes: INote[];
}

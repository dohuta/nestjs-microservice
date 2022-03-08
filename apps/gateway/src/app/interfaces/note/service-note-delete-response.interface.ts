export interface IServiceNoteDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any };
}

export interface INoteDeleteResponse {
  status: number;
  message: string;
  errors: { [key: string]: any } | null;
}

export interface IErrorSource {
  path: string | number | symbol;
  message: string;
}

export interface IGenericErrorResponse {
  statusCode: number;
  message: string;
  errorSources: IErrorSource[];
}

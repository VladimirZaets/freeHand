import { AxiosError } from "axios";

export interface IErrorData {
  status?: number
  statusText: string
  data: any
  message: string
}

export const formatResponseError = async (error: Response):Promise<IErrorData> => {
  return {
    status: error.status,
    statusText: error.statusText || '',
    data: '',
    message: ''
  }
}
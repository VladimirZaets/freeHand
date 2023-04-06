import { AxiosError } from "axios";

export interface IErrorData {
  status?: number
  statusText: string
  data: any
  message: string
}

export const formatResponseError = (error: AxiosError):IErrorData => {
  return {
    status: error.response?.status ||  error.response?.status,
    statusText: error.response?.statusText || '',
    data: error.response?.data || '',
    message: error.message
  }
}
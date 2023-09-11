import {string} from "yup";

export type CreatePasswordParams = {
  password: string
}

export type Fields = CreatePasswordParams

export type Common = {
  isSubmitting: boolean,
  passwordConfirm: string
}

type Error = {
  error: boolean
  message?: string
}
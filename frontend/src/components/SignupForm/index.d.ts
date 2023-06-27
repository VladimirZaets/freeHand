import {string} from "yup";

export type SignupParams = {
  firstname: string,
  lastname: string,
  email: string,
  password: string
  primaryAccountType: string
  dateOfBirth: string
  phone?: string
  city: string
  state: string
  zip: string
}

type ValidationFields = SignupParams & {passwordConfirm?: string}

type Fields = SignupParams

type Common = {
  isSubmitting: boolean,
  passwordConfirm: string
  showPassword: boolean
}
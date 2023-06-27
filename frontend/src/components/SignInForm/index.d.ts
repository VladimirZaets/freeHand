import {string} from "yup";

export type CreateAccountLinkType = {
  position: 'top' | 'bottom',
  text: string,
  path: string
  onClick?: () => void
}

export type ForgotPasswordLinkType = {
  text: string,
  path: string
  onClick?: () => void
}

export type SigninParams = {
  email: string,
  password: string
  keepSignin?: boolean
}

export type Fields = SigninParams
export type Common = {
  isSubmitting: boolean
  showPassword: boolean
}

export type ValidationSchema = {
  email: () => boolean;
  password: () => boolean;
}

export type Validation = {
  email: boolean,
  password: boolean
}

type Error = {
  error: boolean
  message?: string
}

type SigninHandlerType = (data: SigninParams) => Response | Promise<Response>;

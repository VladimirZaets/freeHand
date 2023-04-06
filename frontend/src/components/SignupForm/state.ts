import { string } from 'yup';

export type ValidationType = {
  email: boolean;
  password: boolean;
  firstname: boolean;
  lastname: boolean;
  city: boolean;
  phone: boolean;
  zip: boolean;
  dob: boolean;
  passwordConfirm: boolean;
  state: boolean;
  primaryAccountType: boolean;
}

export type ValidationSchemaType = {
  email: () => any;
  password: () => any;
  firstname: () => any;
  lastname: () => any;
  city: () => any;
  phone: () => any;
  zip: () => any;
  passwordConfirm: () => any;
  dob: () => any;
  state: () => any;
  primaryAccountType: () => any;
}

export const validationSchema = {
  email: string().email().required(),
  password: string().min(8).required(),
  firstname: string().min(2).required(),
  lastname: string().min(2).required(),
  city: string().min(2).required(),
  phone: string().min(10).max(10),
  zip: string().min(5).max(5).required(),
  dob: string().required(),
  state: string().min(2).required(),
  primaryAccountType: string().required(),
  passwordConfirm: string().required()
    .test("passwordConfirm", (value, context) => {
      return value === context.options.context?.password;
    })
};

export const validationFields = {
  email: true, 
  password: true,
  firstname: true,
  lastname: true,
  city: true,
  phone: true,
  zip: true,
  passwordConfirm: true,
  dob: true,
  state: true,
  primaryAccountType: true,
}

export const formFields = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  primaryAccountType: '',
  dob: '',
  zip: '',
  city: '',
  state: '',
}
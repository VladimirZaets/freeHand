import {number, string} from 'yup';

export type ValidationFieldsType = {
  state: boolean;
  message?: string;
}

export type ValidationType = {
  email: ValidationFieldsType;
  password: ValidationFieldsType;
  firstname: ValidationFieldsType;
  lastname: ValidationFieldsType;
  city: ValidationFieldsType;
  phone: ValidationFieldsType;
  zip: ValidationFieldsType;
  dateOfBirth: ValidationFieldsType;
  passwordConfirm: ValidationFieldsType;
  state: ValidationFieldsType;
  primaryAccountType: ValidationFieldsType;
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
  dateOfBirth: () => any;
  state: () => any;
  primaryAccountType: () => any;
}

export const validationSchema = {
  email: string().required("Field is required").email("Invalid email address"),
  password: string()
    .required("Field is required")
    .min(8, "The minimum password length is 8 symbols"),
  firstname: string()
    .required("Field is required")
    .min(2, "Minimum length is 2")
    .max(50, "Maximum length is 50"),
  lastname: string()
    .required("Field is required")
    .min(2, "Minimum length is 2")
    .max(50, "Maximum length is 50"),
  city: string().min(2,"Minimum length is 2"),
  phone: string()
    .matches(/^(1\s?)?(\d{3}|\(\d{3}\))[\s\-]?\d{3}[\s\-]?\d{4}$/, 'Phone number is not valid'),
  zip: string().min(5, "Invalid ZIP code").max(5),
  dateOfBirth: string(),
  state: string().min(2),
  primaryAccountType: string().required(),
  passwordConfirm: string()
    .required('Field is required')
    .test("passwordConfirm", (value, context) => {
      if (value !== context.options.context?.password) {
        return context.createError({ message: "Passwords doesn't match" })
      }
      return true
    })
};

export const validationFields = {
  email: {state: true, message: ''},
  password: {state: true, message: ''},
  firstname: {state: true, message: ''},
  lastname: {state: true, message: ''},
  city: {state: true, message: ''},
  phone: {state: true, message: ''},
  zip: {state: true, message: ''},
  passwordConfirm: {state: true, message: ''},
  dateOfBirth: {state: true, message: ''},
  state: {state: true, message: ''},
  primaryAccountType: {state: true, message: ''},
}

export const createPasswordFields = {
  password: '',
}

export const formFields = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  primaryAccountType: 'customer',
  dateOfBirth: '',
  zip: '',
  city: '',
  state: '',
}
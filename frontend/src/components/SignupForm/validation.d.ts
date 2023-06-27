import {string} from "yup";

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
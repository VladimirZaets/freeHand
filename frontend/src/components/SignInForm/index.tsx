import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import styles from './index.module.css';
//@ts-ignore
import {Common, CreateAccountLinkType, Error, Fields, ForgotPasswordLinkType, SigninHandlerType, SigninParams, Validation, ValidationSchema} from "./index";
import {Link as LinkRouter} from "react-router-dom";
import React, {FormEvent, useState} from 'react';
import {string} from 'yup';
//@ts-ignore
import SocialAuthProviders, {AuthProvidersType} from "../SocialAuthProviders";

const validationSchema = {
  email: string().email().required(),
  password: string().min(8).required()
};

const SigninForm = (
  {
    socialAuthProvidersData,
    signinHandler,
    heading,
    createAccountLink,
    forgotPasswordLink,
  }: {
    socialAuthProvidersData: AuthProvidersType,
    signinHandler: SigninHandlerType,
    heading?: string
    createAccountLink?: CreateAccountLinkType,
    forgotPasswordLink?: ForgotPasswordLinkType,
  }) => {
  const [fields, setFields] = useState<Fields>({email: '', password: ''})
  const [validation, setValidation] = useState<Validation>({email: true, password: true})
  const [common, setCommon] = useState<Common>({isSubmitting: false, showPassword: false})
  const [error, setError] = useState<Error>({error: false})
  const onFormChange = () => {
    setError((error: Error) => ({...error, 'error': false, message: ''}));
  }
  const validateField = (data: Fields) => async (field: string) => {
    //@ts-ignore
    const isValid: boolean = (validationSchema[field as keyof ValidationSchema].isValidSync(data[field as keyof Fields]));
    setValidation((fields: ValidationSchema) => ({
      ...fields,
      [field]: isValid
    }))
    return isValid
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true
    for (const fieldName in fields) {
      isValid = await validateField(fields)(fieldName) || false
    }
    if (isValid) {
      setCommon((common: Common) => ({...common, isSubmitting: true}));
      await signinHandler(fields);
      setCommon((common: Common) => ({...common, isSubmitting: false}));
    }
  }

  return (
    <>
      {
        heading && <Box className={styles['signin-form-title']} sx={{mb: 3}}>
          {
            <Typography variant="h3" component="h3">
              {heading}
            </Typography>
          }
          {
            createAccountLink && createAccountLink.position === 'top' && getCreateAccountLink(createAccountLink)
          }
        </Box>
      }
      {
        !heading && createAccountLink && createAccountLink.position === 'top' &&
        <Box className={styles['signin-form-title']} sx={{mb: 3}}>
          {getCreateAccountLink(createAccountLink)}
        </Box>
      }
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        {
          error.error &&
          <Typography variant="body1" my={2} className={styles['sign-in-error-container']}>
            {error.message}
          </Typography>
        }
        <TextField
          id="email"
          label="Email"
          name="email"
          margin="normal"
          required
          autoComplete="email"
          disabled={common.isSubmitting}
          fullWidth
          value={fields.email}
          error={!validation.email}
          helperText={!validation.email ? 'Invalid email. Please enter correct email address.' : ''}
          onBlur={() => validateField(fields)('email')}
          onChange={(e) => {
            onFormChange();
            setFields((fields: SigninParams) => ({...fields, email: e.target.value}))
          }}
        />
        <TextField
          id="password"
          name="password"
          label="Password"
          required
          type={common.showPassword ? "text" : "password"}
          fullWidth
          autoComplete="password"
          value={fields.password}
          margin="normal"
          disabled={common.isSubmitting}
          error={!validation.password}
          helperText={!validation.password ? 'The password is too short. The password should be at least 8 symbols.' : ''}
          onBlur={() => validateField(fields)('password')}
          onChange={(e) => {
            onFormChange();
            setFields((fields: SigninParams) => ({...fields, password: e.target.value}))
          }}
        />
        <FormControlLabel control={
          <Checkbox
            disabled={common.isSubmitting}
            checked={common.showPassword}
            onChange={(e) => {
              setCommon((fields: Common) => ({...fields, showPassword: !fields.showPassword}))
            }}
          />
        } label="Show password"/>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={common.isSubmitting}
          sx={{my: 2}}
        >
          {
            common.isSubmitting ?
              <CircularProgress size={24}/> :
              "Sign In"
          }
        </Button>
      </Box>
      <Box>
        {
          !!socialAuthProvidersData.length && <SocialAuthProviders data={socialAuthProvidersData}/>
        }
        <LinkRouter onClick={forgotPasswordLink.onClick} to={forgotPasswordLink.link}>
          <Typography variant="body2">
            {forgotPasswordLink.text}
          </Typography>
        </LinkRouter>
        {
          createAccountLink && createAccountLink.position === 'bottom' && getCreateAccountLink(createAccountLink)
        }
      </Box>
    </>
  )
};

const getCreateAccountLink = (createAccountLink: CreateAccountLinkType) => {
  return (
    <LinkRouter onClick={createAccountLink.onClick} to={createAccountLink.path}>
      <Typography variant="body2" component={'span'}>
        {createAccountLink.text}
      </Typography>
    </LinkRouter>
  )
}

export default SigninForm;
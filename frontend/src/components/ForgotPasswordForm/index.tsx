import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import styles from './index.module.css';
//@ts-ignore
import {Common, FortgotPasswordParams, Error, Fields} from './index';
import React, {FormEvent, useState} from 'react';
//@ts-ignore
import {validationFields, validationSchema, ValidationSchemaType, ValidationType,} from '../SignupForm/validation';

const createPasswordFields = {
  password: '',
}

const ForgotPasswordForm = (
  {
    handler,
    onFormChange,
    error,
    captcha
  }: {
    handler(h: FortgotPasswordParams): void,
    onFormChange: (e?: any) => void;
    error?: Error,
    captcha?: React.ReactNode | null,
  }) => {
  const [fields, setFields] = useState<Fields>(createPasswordFields)
  const [validation, setValidation] = useState<ValidationType>(validationFields)
  const [common, setCommon] = useState<Common>({isSubmitting: false})
  const validateField = (data: Fields) => {
    return async (field: string) => {
      const isValid = {
        state: true,
        message: ''
      }
      try {
        // @ts-ignore
        (validationSchema[field as keyof ValidationSchemaType].validateSync(data[field as keyof ValidationFields], {context: {...fields}}));
      } catch (err: any) {
        isValid.state = false
        isValid.message = err.message
      }
      setValidation((fields: ValidationType) => ({
        ...fields,
        [field]: isValid
      }))
      return isValid
    };
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let isValid = true
    const validationFields = {...fields, passwordConfirm: common.passwordConfirm}
    for (const fieldName in validationFields) {
      const validation = await validateField(validationFields)(fieldName)
      isValid = validation.state || false
    }

    if (isValid) {
      setCommon((common: Common) => ({...common, isSubmitting: true}));
      await handler(fields);
      setCommon((common: Common) => ({...common, isSubmitting: false}));
    }
  }

  return (
    <div>
      <>
        {
          captcha || null
        }
        <Box className={styles['form-title']} sx={{mb: 3}}>
          {
            <Typography variant="h3" component="h3">
              Forgot Password
            </Typography>
          }
        </Box>

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
            name="email"
            label="Email"
            required
            type="text"
            fullWidth
            autoComplete="email"
            value={fields.email}
            margin="normal"
            disabled={common.isSubmitting}
            error={!validation.email.state}
            helperText={!validation.email.state ? validation.email.message : ''}
            onBlur={() => validateField(common as any)('email')}
            onChange={(e) => {
              onFormChange(e);
              setFields((fields:Fields) => ({...fields, email: e.target.value}))
            }}
          />
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
                "Send"
            }
          </Button>
        </Box>
        {
          captcha && <Box sx={{fontSize: "12px", display: "inline-block", mt: 2}}>
            This site is protected by reCAPTCHA and the Google&nbsp;
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
            <a href="https://policies.google.com/terms">Terms of Service</a> apply.
          </Box>
        }
      </>
    </div>
  )
};

export default ForgotPasswordForm;
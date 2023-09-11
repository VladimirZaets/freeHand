import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import styles from './index.module.css';
//@ts-ignore
import {Common, ResetPasswordParams, Error, Fields} from './index';
import React, {FormEvent, useState} from 'react';
//@ts-ignore
import {validationFields, validationSchema, ValidationSchemaType, ValidationType,} from '../SignupForm/validation';
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const resetPasswordFields = {
  oldPassword: '',
  password: '',
}

const ResetPasswordForm = (
  {
    handler,
    onFormChange,
    error,
    captcha
  }: {
    handler(handler: ResetPasswordParams): void,
    onFormChange: (e?: any) => void;
    error?: Error,
    captcha?: React.ReactNode | null,
  }) => {
  const [fields, setFields] = useState<Fields>(resetPasswordFields)
  const [validation, setValidation] = useState<ValidationType>(validationFields)
  const [common, setCommon] = useState<Common>({showPassword: false, isSubmitting: false, passwordConfirm: ''})
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
              Reset Password
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
            id="old-password"
            name="old=password"
            label="Current Password"
            required
            type={common.showPassword ? "text" : "password"}
            fullWidth
            autoComplete="password"
            value={fields.oldPassword}
            margin="normal"
            disabled={common.isSubmitting}
            error={!validation.password.state}
            helperText={!validation.password.state ? validation.password.message : ''}
            onBlur={() => validateField(fields)('oldPassword')}
            onChange={(e) => {
              onFormChange(e);
              setFields((fields: ResetPasswordParams) => ({...fields, oldPassword: e.target.value}))
            }}
          />
          <TextField
            id="password"
            name="password"
            label="New Password"
            required
            type={common.showPassword ? "text" : "password"}
            fullWidth
            autoComplete="password"
            value={fields.password}
            margin="normal"
            disabled={common.isSubmitting}
            error={!validation.password.state}
            helperText={!validation.password.state ? validation.password.message : ''}
            onBlur={() => validateField(fields)('password')}
            onChange={(e) => {
              onFormChange(e);
              setFields((fields: ResetPasswordParams) => ({...fields, password: e.target.value}))
            }}
          />
          <TextField
            id="confirm-password"
            name="confirm-password"
            label="Confirm new password"
            required
            type={common.showPassword ? "text" : "password"}
            fullWidth
            autoComplete="confirm-password"
            value={common.passwordConfirm}
            margin="normal"
            disabled={common.isSubmitting}
            error={!validation.passwordConfirm.state}
            helperText={!validation.passwordConfirm.state ? validation.passwordConfirm.message : ''}
            onBlur={() => validateField(common as any)('passwordConfirm')}
            onChange={(e) => {
              onFormChange(e);
              setCommon((fields: Common) => ({...fields, passwordConfirm: e.target.value}))
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
                "Create"
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

export default ResetPasswordForm;
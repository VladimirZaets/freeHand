import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import styles from './index.module.css';
//@ts-ignore
import  SocialAuthProviders, {AuthProvidersType} from "../SocialAuthProviders";
//@ts-ignore
import { SignupParams, ValidationFields, Fields, Common } from './index';
import { Link as LinkRouter } from "react-router-dom";
import React, { useState, FormEvent } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker/DatePicker';
import statesJson from '../../static/states.json';
//@ts-ignore
import { ValidationType, ValidationSchemaType, validationSchema, validationFields } from './validation';
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

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

const SignupForm = (
  {
    socialMediaOptions,
    signupHandler,
    onFormChange,
    error = false,
    errorMessage,
    captcha,
  }: {
    socialMediaOptions: AuthProvidersType,
    signupHandler: (data: SignupParams) => void;
    onFormChange: (e?: any) => void;
    error?: boolean,
    errorMessage?: string
    captcha?: React.ReactNode | null,
  }) => {
  const [fields, setFields] = useState<Fields>(formFields)
  const [validation, setValidation] = useState<ValidationType>(validationFields)
  const [common, setCommon] = useState<Common>({ isSubmitting: false, passwordConfirm: '', showPassword: false })
  const validateField = (data: ValidationFields) => {
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
      setValidation((fields:ValidationType) => ({
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
      setCommon((common:Common) => ({ ...common, isSubmitting: true }));
      await signupHandler(fields);
      setCommon((common:Common) => ({ ...common, isSubmitting: false }));
    }
  }
  return (
    <div className="signup-form">
      {
        captcha || null
      }
      <Box sx={{ p: 5, mx: "auto", my: 10 }} className={styles['form-container']}>
        <Box className={styles['form-title']} sx={{ mb: 3 }}>
          <Typography variant="h3" component="h3">
            Sign Up To Continue
          </Typography>
          <LinkRouter to={'/account/signin'}>
            <Typography variant="body2" component={'span'}>
              Already have account? Login right now!
            </Typography>
          </LinkRouter>
        </Box>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          {
            error &&
            <Typography dangerouslySetInnerHTML={{
              __html: errorMessage || ''
            }} variant="body1" my={2} className={styles['sign-in-error-container']}>

            </Typography>
          }
          <Grid container columnSpacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                id="firstname"
                label="First name"
                name="firstname"
                margin="normal"
                fullWidth
                required
                disabled={common.isSubmitting}
                value={fields.firstname}
                error={!validation.firstname.state}
                helperText={!validation.firstname.state ? validation.firstname.message : ''}
                onBlur={() => validateField(fields)('firstname')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, firstname: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="lastname"
                label="Last name"
                fullWidth
                name="lastname"
                margin="normal"
                required
                disabled={common.isSubmitting}
                value={fields.lastname}
                error={!validation.lastname.state}
                helperText={!validation.lastname.state ? validation.lastname.message : ''}
                onBlur={() => validateField(fields)('lastname')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, lastname: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                sx={{ my: 2, width: "100%" }}
                label="Date of Birth"
                value={fields.dateOfBirth || null}
                onChange={(value) => { onFormChange(value); setFields((fields:Fields) => ({ ...fields, dateOfBirth: value as string })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ my: 2 }}>
                <InputLabel id="patype">Primary Account Type</InputLabel>
                <Select
                  id="demo-simple-select"
                  value={fields.primaryAccountType}
                  label="Primary Account Type"
                  onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, primaryAccountType: e.target.value })) }}                  >
                  <MenuItem value={'customer'}>Customer</MenuItem>
                  <MenuItem value={'contractor'}>Contractor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
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
                error={!validation.email.state}
                helperText={!validation.email.state ? validation.email.message : ''}
                onBlur={() => validateField(fields)('email')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, email: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="phone"
                label="Phone (optional)"
                name="phone"
                margin="normal"
                type={"phone"}
                autoComplete="phone"
                disabled={common.isSubmitting}
                fullWidth
                value={fields.phone}
                error={!validation.phone.state}
                helperText={!validation.phone.state ? validation.phone.message : ''}
                onBlur={() => validateField(fields)('phone')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, phone: e.target.value as string })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="city"
                label="City (street)"
                name="city"
                margin="normal"
                type={"text"}
                disabled={common.isSubmitting}
                fullWidth
                value={fields.city}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, city: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                fullWidth
                id="state"
                sx={{ my: 2 }}
                options={Object.keys(statesJson) as any}
                value={fields.state || null}
                onChange={(e, select:any | null) => {
                  onFormChange(e);
                  if (select) { setFields((fields:Fields) => ({ ...fields, state: select }))}
                }}
                renderInput={(params) => <TextField {...params} label="State" />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                id="zip"
                label="Zip code"
                name="zip"
                margin="normal"
                type={"zip"}
                disabled={common.isSubmitting}
                fullWidth
                value={fields.zip}
                error={!validation.zip}
                helperText={!validation.zip ? 'Invalid zip.' : ''}
                onBlur={() => validateField(fields)('email')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, zip: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
                error={!validation.password.state}
                helperText={!validation.password.state ? validation.password.message : ''}
                onBlur={() => validateField(fields)('password')}
                onChange={(e) => { onFormChange(e); setFields((fields:Fields) => ({ ...fields, password: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                id="confirm-password"
                name="confirm-password"
                label="Confirm password"
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
                onChange={(e) => { onFormChange(e); setCommon((fields:Common) => ({ ...fields, passwordConfirm: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={12} justifyContent={"flex-end"} display={'flex'}>
              <FormControlLabel control={
                <Checkbox
                  id={'show-password'}
                  name={'show-password'}
                  value={common.showPassword}
                  onChange={(e) => { onFormChange(e); setCommon((fields:Common) => ({ ...fields, showPassword: e.target.checked })) }}
                />
              } label="Show password" />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={common.isSubmitting}
            sx={{ my: 2 }}
          >
            {
              common.isSubmitting ?
                <CircularProgress size={24} /> :
                "Sign up"
            }
          </Button>
        </Box>
        {
          !!socialMediaOptions.length &&
          <SocialAuthProviders data={socialMediaOptions}/>
        }
        <LinkRouter to={'/account/password-forgot'}>
          <Typography variant="body2">
            Forgot your password?
          </Typography>
        </LinkRouter>
        {
          captcha && <Box sx={{fontSize: "12px", display: "inline-block", mt:2}}>
            This site is protected by reCAPTCHA and the Google&nbsp;
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
            <a href="https://policies.google.com/terms">Terms of Service</a> apply.
          </Box>
        }
      </Box>
    </div>
  )
};

export default SignupForm;
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
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
import { ReactComponent as GitHubIcon } from '../../icons/github.svg';
import { ReactComponent as GmailIcon } from '../../icons/gmail.svg';
import { ReactComponent as FacebookIcon } from '../../icons/facebook.svg';
import { SigninOption, SigninOptions, ISocialMediaOptionsRequest, SignupParams } from '../../types/account';
import { Link as LinkRouter } from "react-router-dom";
import { useState, FormEvent } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker/DatePicker';
import statesJson from '../../static/states.json';
import { ValidationType, ValidationSchemaType, validationSchema, validationFields, formFields } from './state';
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

type ValidationFields = SignupParams & {passwordConfirm?: string}
type Fields = SignupParams

type Common = {
  isSubmitting: boolean,
  passwordConfirm: string
  showPassword: boolean
}

const SignupForm = (
  {
    socialMediaOptions,
    signupHandler,
    onFormChange,
    error = false,
    errorMessage
  }: {
    socialMediaOptions: ISocialMediaOptionsRequest,
    signupHandler: (data: SignupParams) => void;
    onFormChange: (e?: any) => void;
    error?: boolean,
    errorMessage?: string
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
        (validationSchema[field as keyof ValidationSchemaType].validateSync(data[field as keyof ValidationFields], {context: {...fields}}));
      } catch (err: any) {
        isValid.state = false
        isValid.message = err.message
      }
      setValidation((fields) => ({
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
      setCommon((common) => ({ ...common, isSubmitting: true }));
      await signupHandler(fields) as any;
      setCommon((common) => ({ ...common, isSubmitting: false }));
    }
  }
  return (
    <div className="signup-form">
      <Box sx={{ p: 5, mx: "auto", my: 10 }} className={styles['signin-form-container']}>
        <Box className={styles['signin-form-title']} sx={{ mb: 3 }}>
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
            <Typography variant="body1" my={2} className={styles['sign-in-error-container']}>
              {errorMessage}
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, firstname: e.target.value })) }}
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, lastname: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                sx={{ my: 2, width: "100%" }}
                label="Date of Birth"
                value={fields.dateOfBirth || null}
                onChange={(value) => { onFormChange(value); setFields((fields) => ({ ...fields, dateOfBirth: value as string })) }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ my: 2 }}>
                <InputLabel id="patype">Primary Account Type</InputLabel>
                <Select
                  id="demo-simple-select"
                  value={fields.primaryAccountType}
                  label="Primary Account Type"
                  onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, primaryAccountType: e.target.value })) }}                  >
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, email: e.target.value })) }}
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, phone: e.target.value as string })) }}
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, city: e.target.value })) }}
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
                  if (select) { setFields((fields) => ({ ...fields, state: select }))}                  
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
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, zip: e.target.value })) }}
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
                onBlur={(e) => validateField(fields)('password')}
                onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, password: e.target.value })) }}
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
                onBlur={(e) => validateField(common as any)('passwordConfirm')}
                onChange={(e) => { onFormChange(e); setCommon((fields) => ({ ...fields, passwordConfirm: e.target.value })) }}
              />
            </Grid>
            <Grid item xs={12} md={12} justifyContent={"flex-end"} display={'flex'}>
              <FormControlLabel control={
                <Checkbox
                  id={'show-password'}
                  name={'show-password'}
                  value={common.showPassword}
                  onChange={(e) => { onFormChange(e); setCommon((fields) => ({ ...fields, showPassword: e.target.checked })) }}
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
          socialMediaOptions.request.status === 'fulfilled' &&
          socialMediaOptions.data?.length &&
          getSocialBlock(socialMediaOptions.data)
        }
        <LinkRouter to={'/account/password-forgot'}>
          <Typography variant="body2">
            Forgot your password?
          </Typography>
        </LinkRouter>
      </Box>
    </div>
  )
};

const getFacebookElement = (key: number) => <Link key={key} href="#dsds"><FacebookIcon width={23} /></Link>
const getGmailElement = (key: number) => <Link key={key} href="#dsds"><GmailIcon width={28} /></Link>
const getGithubElement = (key: number) => (<Link key={key} href="#dsds"><GitHubIcon width={26} /></Link>)
const bindSocialtoNodes = (socialOptions: SigninOptions) => socialOptions.map((item: SigninOption, i: number) => {
  if (item.name === 'facebook') {
    return getFacebookElement(i)
  } else if (item.name === 'google') {
    return getGmailElement(i)
  } else if (item.name === 'github') {
    return getGithubElement(i)
  }
  return null
});

const getSocialBlock = (socialOptions: SigninOptions) => {
  return (
    <Box sx={{ mt: 3 }} className={styles['signin-form-social-media']}>
      <Typography>
        or sign in by social media:
      </Typography>
      <Box className={styles['signin-form-icons-container']}>
        {bindSocialtoNodes(socialOptions)}
      </Box>
    </Box>
  )
}

export default SignupForm;
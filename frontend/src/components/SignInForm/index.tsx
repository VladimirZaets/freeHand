import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import styles from './index.module.css';
import { ReactComponent as GitHubIcon } from '../../icons/github.svg';
import { ReactComponent as GmailIcon } from '../../icons/gmail.svg';
import { ReactComponent as FacebookIcon } from '../../icons/facebook.svg';
import { SigninOption, SigninOptions, ISocialMediaOptionsRequest, SigninParams } from '../../types/account';
import { Link as LinkRouter } from "react-router-dom";
import { useState, FormEvent } from 'react';
import { string } from 'yup';

type Fields = SigninParams
type Common = {
  isSubmitting: boolean
}

type ValidationSchema = {
    email: () => any;
    password: () => any;
}
type Validation = {
    email: boolean,
    password: boolean
}

const validationSchema = {
  email: string().email().required(),
  password: string().min(8).required()
};

const SigninForm = (
  {
    socialMediaOptions,
    signinHandler,
    onFormChange,
    error = false,
    errorMessage 
  }: {
        socialMediaOptions: ISocialMediaOptionsRequest,
        signinHandler: (data: SigninParams) => void;
        onFormChange: (e?:any) => void;       
        error?: boolean,
        errorMessage?: string
    }) => {
  const [fields, setFields] = useState<Fields>({ email: '', password: '' })
  const [validation, setValidation] = useState<Validation>({ email: true, password: true })
  const [common, setCommon] = useState<Common>({ isSubmitting: false })
  const validateField = (data: Fields) => async (field: string) => {
    const isValid = (validationSchema[field as keyof ValidationSchema].isValidSync(data[field as keyof Fields]));
    setValidation((fields) => ({
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
      setCommon((common) => ({...common, isSubmitting: true}));
      await signinHandler(fields);
      setCommon((common) => ({...common, isSubmitting: false}));            
    }
  }
  return (
    <div className="signin-form">
      <Box sx={{ p: 5, mx: "auto", my: 10 }} className={styles['signin-form-container']}>
        <Box className={styles['signin-form-title']} sx={{ mb: 3 }}>
          <Typography variant="h3" component="h3">
                        Sign In To Continue
          </Typography>
          <LinkRouter to={'/account/signup'}>
            <Typography variant="body2" component={'span'}>
              Don't have account? Create it right now!
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
            onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, email: e.target.value })) }}
          />
          <TextField
            id="password"
            name="password"
            label="Password"
            required
            type="password"
            fullWidth
            autoComplete="password"
            value={fields.password}
            margin="normal"
            disabled={common.isSubmitting}
            error={!validation.password}
            helperText={!validation.password ? 'The password is too short. The password should be at least 8 symbols.' : ''}
            onBlur={(e) => validateField(fields)('password')}
            onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, password: e.target.value })) }}
          />          
          <FormControlLabel control={
            <Checkbox
              disabled={common.isSubmitting}
              checked={fields.keepSignin}
              onChange={(e) => { onFormChange(e); setFields((fields) => ({ ...fields, keepSignin: e.target.checked })) }}
            />
          } label="Keep me signed in" />
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
                "Sign In"
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

export default SigninForm;
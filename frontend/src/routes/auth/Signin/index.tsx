// @ts-ignore
import SignInForm, {SigninParams} from "../../../components/SignInForm/index";
import {useAppDispatch, useAppSelector} from '../../../store';
import Box from '@mui/material/Box';
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router-dom';
import React from "react";
import {signin} from "../../../redux/auth/actions";
import {getAuthProvidersSelector} from "../../../redux/auth/selectors";
import styles from "./index.module.css";
import accountRoutes from "../../../routes/account/routes";
import authRoutes from "../../../routes/auth/routes";


const Login = () => {
  const socialMediaOptionsState = useAppSelector(getAuthProvidersSelector)
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const recaptchaRef = React.createRef();
  const handleSubmit = async (data: SigninParams) => {
    const current = recaptchaRef.current as any;
    data["g-recaptcha-response"] = await current.executeAsync();
    try {
      await dispatch(signin(data)) as any;
      navigate('/');
    } catch (error) {
      window.scrollTo(0, 0);
      current.reset();
    }
  }

  return <div className="login-content">
    <div className="signin-form">
      <Box sx={{p: 5, mx: "auto", my: 10}} className={styles['signin-form-container']}>
        <SignInForm
          heading="Sign In To Continue"
          captcha={<ReCAPTCHA
            ref={recaptchaRef as any}
            size="invisible"
            sitekey=""
          />}
          socialAuthProvidersData={socialMediaOptionsState}
          signinHandler={handleSubmit}
          forgotPasswordLink={{
            text: 'Forgot your password?',
            url: `${accountRoutes.base}/${accountRoutes.pathname.passwordForgot}`,
          }}
          createAccountLink={{
            text: 'Don\'t have account? Create it right now!',
            url: `${authRoutes.base}/${authRoutes.pathname.signup}`,
            position: 'top',
          }}
        />
      </Box>
    </div>
  </div>
};

export default Login;
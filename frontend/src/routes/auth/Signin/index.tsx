// @ts-ignore
import SignInForm, {SigninParams} from "../../../components/SignInForm/index";
import {useAppDispatch, useAppSelector} from '../../../store';
import Box from '@mui/material/Box';
import {signin} from "../../../redux/auth/actions";
import {getAuthProvidersSelector} from "../../../redux/auth/selectors";
// @ts-ignore
import {useState} from "react";
import styles from "./index.module.css";
import accountRoutes from "../../../routes/account/routes";
import authRoutes from "../../../routes/auth/routes";

type Error = {
  error: boolean
  message?: string
}

const Login = () => {
  const socialMediaOptionsState = useAppSelector(getAuthProvidersSelector)
  const dispatch = useAppDispatch();
  const handleSubmit = async (data: SigninParams) => {
    return dispatch(signin(data)) as any;
  }

  return <div className="login-content">
    <div className="signin-form">
      <Box sx={{p: 5, mx: "auto", my: 10}} className={styles['signin-form-container']}>
        <SignInForm
          heading="Sign In To Continue"
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
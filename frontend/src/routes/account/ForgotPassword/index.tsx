//@ts-ignore
import ForgotPasswordForm, {ForgotPasswordParams, Error} from "../../../components/ForgotPasswordForm/index";
import { useAppDispatch } from '../../../store';
import { forgotPassword } from "../../../redux/account/actions";
import React, { useState } from "react";
import Box from '@mui/material/Box';

//@ts-ignore
import {RequestStatusCodes, responseType} from "../../../api/request";
import paths from "../../../api/paths";
import {useNavigate} from "react-router-dom";
import styles from "../../auth/Signin/index.module.css";
import ReCAPTCHA from "react-google-recaptcha";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<Error>({ error: false })
  const navigate = useNavigate();
  const recaptchaRef = React.createRef();

  const handleSubmit = async (data:ForgotPasswordParams) => {
    const current = recaptchaRef.current as any;
    data["g-recaptcha-response"] = await current.executeAsync();
    try {
      await dispatch(forgotPassword(data)) as any;
      navigate('/');
    } catch (error: responseType) {
      window.scrollTo(0, 0);
      current.reset();
      let message: string
      error.status === RequestStatusCodes.CONFLICT ?
        message = `User with email "${data.email}" already exists. Go to <a href="${paths.auth.signin}">login</a>.` :
        message = 'Service is unavailable. Please reload the page or try again later.';
      setError((error:Error) => ({...error, 'error': true, message}))
    }
  }

  const onFormChange = () => {
    setError((error:Error) => ({...error, 'error': false, message: ''}));
  }

  return <Box sx={{p: 5, mx: "auto", my: 10}} className={styles['form-container']}>
    <ForgotPasswordForm
      handler={handleSubmit}
      onFormChange={onFormChange}
      error={error}
      captcha={<ReCAPTCHA
        ref={recaptchaRef as any}
        size="invisible"
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY as string}
      />}
    />
  </Box>
};

export default ForgotPassword;
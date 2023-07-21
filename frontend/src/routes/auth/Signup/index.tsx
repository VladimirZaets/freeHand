//@ts-ignore
import SignupForm, {SignupParams} from "../../../components/SignupForm/index";
import { useAppSelector, useAppDispatch } from '../../../store';
import { useNavigate } from 'react-router-dom';
import {signup} from "../../../redux/auth/actions";
import React, { useState } from "react";
import {getAuthProvidersSelector} from "../../../redux/auth/selectors";
import ReCAPTCHA from "react-google-recaptcha";
//@ts-ignore
import {responseType, RequestStatusCodes} from "../../../api/request";
import paths from "../../../api/paths";

type Error = {
  error: boolean
  message?: string
}

const Signup = () => {
  const socialMediaOptionsState = useAppSelector(getAuthProvidersSelector)
  const dispatch = useAppDispatch();
  const [error, setError] = useState<Error>({ error: false })
  const navigate = useNavigate();
  const recaptchaRef = React.createRef();
  const handleSubmit = async (data:SignupParams) => {
    const current = recaptchaRef.current as any;

    data["g-recaptcha-response"] = await current.executeAsync();
    try {
      await dispatch(signup(data)) as any;
      navigate('/');
    } catch (error:responseType) {
      window.scrollTo(0, 0);
      current.reset();
      let message:string
      error.status === RequestStatusCodes.CONFLICT ?
        message = `User with email "${data.email}" already exists. Go to <a href="${paths.auth.signin}">login</a>.` :
        message = 'Service is unavailable. Please reload the page or try again later.';
      setError((error) => ({...error, 'error': true, message}))
    }
  }
  const onFormChange = () => {
    setError((error) => ({...error, 'error': false, message: ''}));
  }

  return <div className="login-content">
    <SignupForm
      captcha={<ReCAPTCHA
        ref={recaptchaRef as any}
        size="invisible"
        sitekey=""
      />}
      socialMediaOptions={socialMediaOptionsState}
      signupHandler={handleSubmit}
      onFormChange={onFormChange}
      error={error.error}
      errorMessage={error.message}
    />
  </div>
};

export default Signup;
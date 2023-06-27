//@ts-ignore
import SignupForm, {SignupParams} from "../../../components/SignupForm/index";
import { useAppSelector, useAppDispatch } from '../../../store';
import { useNavigate } from 'react-router-dom';
import {getUser} from "../../../redux/account/actions";
import {signup} from "../../../redux/auth/actions";
import { createAlert } from "../../../redux/common/reducer";
import { useState } from "react";
import {getAuthProvidersSelector} from "../../../redux/auth/selectors";

type Error = {
  error: boolean
  message?: string
}

const Signup = () => {
  const socialMediaOptionsState = useAppSelector(getAuthProvidersSelector)
  const dispatch = useAppDispatch();
  const [error, setError] = useState<Error>({ error: false })
  const navigate = useNavigate();
  const handleSubmit = async (data:SignupParams) => {
    const response = await dispatch(signup(data)) as any;
    if (!response.ok && response.status === 409) {
      const message = `User with email "${data.email}" already exists. Please login.`;
      setError((error) => ({...error, 'error': true, message}));
      window.scrollTo(0, 0);
    } else if (response.ok) {
      const message = 'Service is unavailable. Please reload the page or try again later.';
      setError((error) => ({...error, 'error': true, message}));
      window.scrollTo(0, 0);
    } else {
      dispatch(createAlert({
        type: 'success',
        message: 'Account is created successfully. Please check your email to verify your account.'
      }));
      dispatch(getUser())
      navigate(`/`);
    }
  }
  const onFormChange = () => {
    setError((error) => ({...error, 'error': false, message: ''}));
  }

  return <div className="login-content">
    <SignupForm
      socialMediaOptions={socialMediaOptionsState}
      signupHandler={handleSubmit}
      onFormChange={onFormChange}
      error={error.error}
      errorMessage={error.message}
    />
  </div>
};

export default Signup;
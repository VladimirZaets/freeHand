import SignupForm from "../../../components/SignupForm";
import { useAppSelector, useAppDispatch } from '../../../store';
import { useNavigate } from 'react-router-dom';
import {getUserByToken, signup} from "../../../redux/account/actions";
import { SignupParams } from '../../../types/account';
import { createNotification } from "../../../redux/common/reducer";
import { useState } from "react";

type Error = {
  error: boolean
  message?: string
}

const Signup = () => {
  const socialMediaOptionsState = useAppSelector((state) => state.account.signin.socialOptions)
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
      dispatch(createNotification({
        type: 'success',
        message: 'Account is created successfully. Please check your email to verify your account.'
      }));
      dispatch(getUserByToken())
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
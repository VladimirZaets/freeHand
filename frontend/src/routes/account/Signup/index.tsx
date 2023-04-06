import SignupForm from "../../../components/SignupForm";
import { useAppSelector, useAppDispatch } from '../../../store';
import { signin } from "../../../redux/account/actions";
import { SigninParams } from '../../../types/account';
import { useState } from "react";

type Error = {
  error: boolean
  message?: string
}

const Login = () => {
  const socialMediaOptionsState = useAppSelector((state) => state.account.signin.socialOptions)
  const dispatch = useAppDispatch();
  const [error, setError] = useState<Error>({ error: false })
  const handleSubmit = async (data:SigninParams) => {
    const response = await dispatch(signin(data)) as any;
    if (response.error) {
      const message = 'Service is unavailable. Please reload the page or try again later.';      
      setError((error) => ({...error, 'error': true, message}));
    }
  }
  const onFormChange = () => {
    setError((error) => ({...error, 'error': false, message: ''}));
  }

  return <div className="login-content">
    <SignupForm
      socialMediaOptions={socialMediaOptionsState}
      signinHandler={handleSubmit}
      onFormChange={onFormChange}
      error={error.error}
      errorMessage={error.message}
    />
  </div>
};

export default Login;
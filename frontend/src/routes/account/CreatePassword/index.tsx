import CreatePasswordForm from "../../../components/SignupForm/CreatePassword";
import { useAppDispatch } from '../../../store';
import { createPassword } from "../../../redux/account/actions";
import {CreatePasswordParams} from '../../../types/account';
import { useState } from "react";

type Error = {
  error: boolean
  message?: string
}

const Login = () => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<Error>({ error: false })
  const handleSubmit = async (data:CreatePasswordParams) => {
    const response = await dispatch(createPassword(data)) as any;
    if (response.error) {
      const message = 'Service is unavailable. Please reload the page or try again later.';      
      setError((error) => ({...error, 'error': true, message}));
    }
  }
  const onFormChange = () => {
    setError((error) => ({...error, 'error': false, message: ''}));
  }

  return <div className="login-content">
    <CreatePasswordForm
      createPasswordHandler={handleSubmit}
      onFormChange={onFormChange}
      error={error.error}
      errorMessage={error.message}
    />
  </div>
};

export default Login;
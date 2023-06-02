import VerifyEmailForm from "../../../components/SignupForm/VerifyEmail";
import { useAppDispatch } from '../../../store';
import { createPassword } from "../../../redux/account/actions";
import {CreatePasswordParams} from '../../../types/account';
import { useState } from "react";
import { useParams } from 'react-router-dom';


type Error = {
  error: boolean
  message?: string
}

const VerifyEmail = () => {
  const {hash} = useParams();

  return <div className="login-content">
    <VerifyEmailForm
      email={atob(hash as string)}
    />
  </div>
};

export default VerifyEmail;
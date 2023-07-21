import {useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState} from "react";
import {verifyEmail} from "../../../redux/account/actions";
import {useAppDispatch} from "../../../store";
import {unwrapResult} from "@reduxjs/toolkit";
import styles from "../../../components/EmailVerification/index.module.css";
import Box from "@mui/material/Box";

const EmailVerificationRoute = () => {
  const {hash} = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setIsLoading] = useState<{ loading: boolean }>({loading: true})
  const [message, setMessage] = useState<{ message: string }>({message: ""})


  useEffect( () => {
    const asyncFunc = async () => {
      try {
        const data = await dispatch(verifyEmail(hash as string))
      } catch (err) {
      }
    }

    asyncFunc()

    dispatch(verifyEmail(hash as string)).then((response) => {
      setIsLoading({loading: false})
      if (response.ok) {
        navigate('/')
        return Promise.resolve(response);
      } else {
        setMessage({message: response.message})
        return Promise.reject(response);
      }

    }).catch((error) => {
      console.log(error)
    })
  }, [hash])

  return <div className="login-content">
    <Box sx={{p: 5, mx: "auto", my: 10}} className={styles['email-verification-form-container']}>
      {
        loading.loading && !message.message ?
          <div>Verification... Please wait a minute.</div> :
          <div>The token is expired. Please, use <a href={"dsds/dsds/"}>this link</a> to request new verification email.
          </div>
      }
    </Box>
  </div>
};

export default EmailVerificationRoute;
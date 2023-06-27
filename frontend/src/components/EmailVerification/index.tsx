import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import styles from './index.module.css';

const EmailVerification = (
  {
    email
  }: {
    email: string,
  }) => {
  return (
    <div>
      <Box sx={{ p: 5, mx: "auto", my: 10 }} className={styles['email-verification-form-container']}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
          Account is created. Please verify your email for use all features of Freehands service.
          Email verification message was sent to "{email}". Please check your email and follow the instructions.
        </Typography>
      </Box>
    </div>
  )
};

export default EmailVerification;
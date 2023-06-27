import EmailVerification from "../../../components/EmailVerification";
import { useParams } from 'react-router-dom';

const EmailVerificationRoute = () => {
  const {hash} = useParams();

  return <div className="login-content">
    <EmailVerification
      email={atob(hash as string)}
    />
  </div>
};

export default EmailVerificationRoute;
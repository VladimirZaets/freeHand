import {Navigate, Route, Routes} from "react-router-dom";
import Signin from "./Signin";
import Signup from "./Signup";
import EmailVerification from "./EmailVerification";
import routes from "./routes";

const Layout = () => {
  return (
    <Routes>
      <Route path={routes.pathname.signin} element={<Signin/>}/>
      <Route path={routes.pathname.signup} element={<Signup/>}/>
      <Route path={routes.pathname.confirmEmail} element={<EmailVerification/>}/>
      <Route path="*" element={<Navigate to={routes.pathname.signin}/>} />
    </Routes>
  )
}

export default Layout
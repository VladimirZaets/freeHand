import {Routes, Route, Navigate} from "react-router-dom";
import Profile from "./Profile";
import CreatePassword from "./CreatePassword";
import routes from "./routes";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const Account = () => {
  return <div>
    <Routes>
      <Route path={routes.pathname.passwordCreate} element={<CreatePassword/>}/>
      <Route path={routes.pathname.passwordForgot} element={<ForgotPassword/>}/>
      <Route path={routes.pathname.passwordReset} element={<ResetPassword/>}/>
      <Route path={routes.pathname.profile} element={<Profile />} />
      <Route path="*" element={<Navigate to={routes.pathname.profile}/>} />
    </Routes>
  </div>
}

export default Account
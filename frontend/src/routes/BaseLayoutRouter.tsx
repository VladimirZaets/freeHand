import HeaderFooter from "../components/Layout/HeaderFooter";
import AccountLayoutRouter from "./AccountLayoutRouter";
import Signin from "./account/Signin";
import Signup from "./account/Signup";
import VerifyEmail from "./account/Signup/VerifyEmail";
import CreatePassword from "./account/CreatePassword";
import {Routes, Route} from "react-router-dom";

const BaseLayoutRouter = () => {   
  return <HeaderFooter>
    <Routes>
      <Route path="account/signin" element={<Signin />} />
      <Route path="account/signup" element={<Signup />} />
      <Route path="account/signup/confirm/:hash" element={<VerifyEmail />} />
      <Route path="account/signup/password" element={<CreatePassword />} />
      <Route path="account/*" element={<AccountLayoutRouter />} />
    </Routes>
  </HeaderFooter>
}

export default BaseLayoutRouter;
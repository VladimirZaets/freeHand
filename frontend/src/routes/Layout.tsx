import HeaderFooter from "../layout/HeaderFooter";
import AccountLayout from "./account/Layout";
import AuthLayout from "./auth/Layout";
import {Route, Routes} from "react-router-dom";
import RedirectHandler from "../layout/RedirectHandler";
import authRoutes from './auth/routes';
import accountRoutes from './account/routes';

const Base = () => {
  return (
    <HeaderFooter>
      <RedirectHandler>
        <Routes>
          <Route path={`${accountRoutes.base}/*`} element={<AccountLayout/>}/>
          <Route path={`${authRoutes.base}/*`} element={<AuthLayout/>}/>
        </Routes>
      </RedirectHandler>
    </HeaderFooter>
  )
}

export default Base;
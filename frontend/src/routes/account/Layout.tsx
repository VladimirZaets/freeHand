import {Routes, Route, Navigate} from "react-router-dom";
import SideMenu from '../../components/Menu';
import Profile from "./Profile";
import CreatePassword from "./CreatePassword";
import routes from "./routes";

const Account = () => {
  return <div>
    <SideMenu items={[
      {
        text: 'Persona Information',
        link: 'some/url'
      },
      {
        text: 'Messages',
        link: 'some/url'
      },
    ]}/>
    <Routes>
      <Route path={routes.pathname.passwordCreate} element={<CreatePassword/>}/>
      <Route path={routes.pathname.profile} element={<Profile />} />
      <Route path="*" element={<Navigate to={routes.pathname.profile}/>} />
    </Routes>
  </div>
}

export default Account
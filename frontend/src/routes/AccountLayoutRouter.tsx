import {Routes, Route, Navigate} from "react-router-dom";
import SideMenu from '../components/Menu';
import Profile from "./account/Profile";

const AccountLayoutRouter = () => {
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
      <Route path="/" element={<Navigate to={'profile'}/>} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  </div>
}

export default AccountLayoutRouter
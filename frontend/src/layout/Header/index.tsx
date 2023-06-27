import * as React from 'react';
import {useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import Link from '@mui/material/Link';
import {useAppDispatch, useAppSelector} from '../../store';
import UserAlert from "../../components/Alert/index";
// @ts-ignore
import Notifications, {INotification} from '../../components/Notification/index';
import {getAlertSelector, isUserUpdateRequiredSelector} from "../../redux/common/selectors";
import Messages from '../../components/Messages';
import AvatarFull, {AvatarMobile} from '../../components/Avatar/index';
import ProfileMenu from '../../components/ProfileMenu';
import Search from '../../components/Search';
import {getNotifications, getUser, updateNotificationStorage} from "../../redux/account/actions";
import {updateNotification} from "../../redux/account/reducer";
import {getNotificationsSelector, getUserSelector} from "../../redux/account/selectors";
import {closeAlert} from '../../redux/common/reducer';
import LoginMenu from "../../components/LoginMenu/index";
import {getAuthProviders, signin, signout} from "../../redux/auth/actions";
// @ts-ignore
import {SigninParams} from "../../components/SignInForm";
import accountRoutes from "../../routes/account/routes";
import authRoutes from "../../routes/auth/routes";
import {getAuthProvidersSelector} from "../../redux/auth/selectors";

type HeaderProps = {
  toggleSideMenu: (openState: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function Header({toggleSideMenu}: HeaderProps) {
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);

  const isUserUpdateRequired = useAppSelector(isUserUpdateRequiredSelector)
  useEffect(() => {
    if (isUserUpdateRequired) {
      dispatch(getUser()).then((response) => {
        if (!response.payload?.id) {
          dispatch(getAuthProviders())
        }
      })
    }
  }, [isUserUpdateRequired, dispatch]);
  const user = useAppSelector(getUserSelector);
  useEffect(() => {
    if (user) {
      dispatch(getNotifications())
    }
  }, [user, dispatch]);
  const notifications = useAppSelector(getNotificationsSelector);
  const alertData = useAppSelector(getAlertSelector);
  const socialMediaOptionsState = useAppSelector(getAuthProvidersSelector)
  const signoutHandler = () => {
    dispatch(signout())
    dispatch(getAuthProviders())
    handleMenuClose()
  }
  const handleAlertClose = () => {
    dispatch(closeAlert());
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleNotificationItemClick = (e: Event, n: INotification) => {
    const updatedNotification = {...n, is_read: !n.is_read};
    dispatch(updateNotification(updatedNotification));
    dispatch(updateNotificationStorage(updatedNotification));
  }
  const handleSubmitLoginDropdown = async (data: SigninParams) => {
    handleMenuClose();
    return await dispatch(signin(data)) as any;
  }

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{mr: 2}}
            onClick={toggleSideMenu(true)}
          >
            <MenuIcon/>
          </IconButton>
          <Link
            variant="h6"
            noWrap
            component="a"
            href="/"
            color={'#fff'}
            underline="none"
            sx={{display: {xs: 'none', sm: 'block'}}}
          >
            FreeHands
          </Link>
          <Box sx={{flexGrow: 1}}/>
          <Search/>
          {user?.id &&
            <>
              <Box ml={"10px"} sx={{display: {xs: 'none', md: 'flex'}, alignItems: "center"}}>
                <Messages/>
                <Notifications items={notifications} onClick={handleNotificationItemClick}/>
              </Box>
              <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                <IconButton
                  size="large"
                  aria-label="show more"
                  aria-haspopup="true"
                  onClick={handleMobileMenuOpen}
                  color="inherit"
                >
                  <MoreIcon/>
                </IconButton>
              </Box>
            </>
          }
          <Box sx={{display: {xs: 'none', md: 'flex'}}}>
            <AvatarFull user={user} onClick={handleProfileMenuOpen}/>
          </Box>
        </Toolbar>
      </AppBar>
      <UserAlert data={alertData} onClose={handleAlertClose}/>
      {user?.id && (
        <>
          <ProfileMenu anchorEl={mobileMoreAnchorEl} onClose={handleMobileMenuClose} menuItems={[
            {
              component: (
                <div>
                  <Messages/>
                  <p>Messages</p>
                </div>)
            },
            {
              component: (
                <div>
                  <Notifications items={notifications} onClick={handleNotificationItemClick}/>
                  <p>Notifications</p>
                </div>)
            },
            {component: <AvatarMobile user={user}/>, onClick: handleProfileMenuOpen},
          ]}/>
          <ProfileMenu name={user.data?.attrs.firstname} anchorEl={anchorEl} onClose={handleMenuClose} menuItems={[
            {text: "Profile", link: "/profile"},
            {text: "Settings", link: "/settings"},
            {text: "Logout", onClick: signoutHandler},
          ]}/>
        </>
      )}
      {!user?.id && <LoginMenu
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        forgotPasswordLink={{
          onClick: handleMenuClose,
          text: 'Forgot your password?',
          path: `${accountRoutes.base}/${accountRoutes.pathname.passwordForgot}`,
        }}
        createAccountLink={{
          onClick: handleMenuClose,
          text: 'Don\'t have account? Create it right now!',
          path: `${authRoutes.base}/${authRoutes.pathname.signup}`,
          position: 'bottom',
        }}
        onSubmitHandler={handleSubmitLoginDropdown}
        socialAuthProvidersData={socialMediaOptionsState}
      />
      }
    </Box>
  );
}
import * as React from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import Link from '@mui/material/Link';
import { useAppSelector } from '../../store';
import { asyncStatuses } from '../../redux/status';
import Avatar from '@mui/material/Avatar';
import { IUserRequest } from '../../types/account';
import Typography from '@mui/material/Typography';
import Notification from "../Notification";
import styles from './index.module.css'

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

type HeaderProps = {
  toggleSideMenu: (openState: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function Header({ toggleSideMenu }: HeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const user = useAppSelector((state) => state.account.user);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const renderAvatar = (user: IUserRequest) => {
    let block;
    if (user.request.status === asyncStatuses.fulfilled) {
      block = user.data?.avatarUrl ?
        <Avatar alt={user.data?.name} src={user.data?.avatarUrl} /> :
        <Avatar alt={user.data?.name} sx={{ bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}>{user.data?.name[0].toUpperCase()}</Avatar>
    } else {
      block = <AccountCircle />
    }
    return (
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
      >
        {block}
      </IconButton>
    )
  }

  const renderNotification = (user: IUserRequest) => {
    if (user.request.status === asyncStatuses.fulfilled) {
      return (
        <>
          <IconButton size="large" aria-label="show 4 new mails" color="inherit">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>
          <IconButton
            size="large"
            aria-label="show 17 new notifications"
            color="inherit"
          >
            <Badge badgeContent={17} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </>
      )
    }
    return null;
  }

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      PaperProps={{
        sx:{p:1}
      }}      
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={!!anchorEl}
      onClose={handleMenuClose}
    >
      {user.request.status === asyncStatuses.fulfilled && (
        <MenuItem disabled>
          <Typography variant={'h3'}>
            Welcome, {user.data?.name}
          </Typography>
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={handleMenuClose} > Profile</MenuItem >
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={!!mobileMoreAnchorEl}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={toggleSideMenu(true)}
          >
            <MenuIcon />
          </IconButton>
          <Link
            variant="h6"
            noWrap
            component="a"
            href="/"
            color={'#fff'}
            underline="none"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            FreeHands
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Box
            component={'div'}
            sx={{ width: { sm: "auto" } }}
            className={styles['search-container']}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Box>
          {user.request.status === asyncStatuses.fulfilled &&
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {renderNotification(user)}
              {renderAvatar(user)}
            </Box>
          }
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Notification/>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
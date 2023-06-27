//@ts-ignore
import {IAvatarUser} from "./index";
import Avatar from "@mui/material/Avatar";
import AccountCircle from "@mui/icons-material/AccountCircle";
import IconButton from "@mui/material/IconButton";
import * as React from "react";

const Avtr = ({user, onClick}: {user:IAvatarUser, onClick:(event: React.MouseEvent<HTMLElement>) => void}) => {
  let block;
  if (user?.id) {
    block = user?.attrs?.avatarUrl ?
      <Avatar alt={user.attrs.firstname} src={user.attrs?.avatarUrl} /> :
      <Avatar alt={user.attrs.firstname} sx={{ bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}>
        {user.attrs.firstname ? user.attrs.firstname[0].toUpperCase() : "P"}
      </Avatar>
  } else {
    block = <AccountCircle/>
  }
  return (
    <IconButton
      size="large"
      edge="end"
      aria-label="account of current user"
      aria-haspopup="true"
      onClick={onClick}
      color="inherit"
    >
      {block}
    </IconButton>
  )
}

export const AvatarMobile = ({user}: {user:IAvatarUser}) => {
  if (user?.id) {
    return (
      <>
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
      </>
    )
  }
  return null;
}

export default Avtr;
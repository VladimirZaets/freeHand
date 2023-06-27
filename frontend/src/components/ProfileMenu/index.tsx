import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import * as React from "react";

type ProfileMenuItemType = {
  text?: string
  link?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  component?: React.ReactNode
}

const ProfileMenu = ({ name, anchorEl, onClose, menuItems }: {menuItems: ProfileMenuItemType[], name?: string, anchorEl: null | HTMLElement, onClose: (event: React.MouseEvent<HTMLElement>) => void}) => {
  return (
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
      onClose={onClose}
    >
      {name && (
        <div>
          <MenuItem disabled>
            <Typography variant={'h3'}>
              Welcome, {name}
            </Typography>
          </MenuItem>
          <Divider />
        </div>
      )}
      {menuItems.map((item, i) => {
        if (item.link) {
          return <MenuItem key={i} href={item.link}>{item.text || item.component }</MenuItem >
        } else if (item.onClick) {
          return <MenuItem key={i} onClick={item.onClick}>{item.text || item.component }</MenuItem>
        } else {
          return <MenuItem key={i} >{item.text || item.component }</MenuItem >
        }
      })}
    </Menu>
  );
}

export default ProfileMenu;
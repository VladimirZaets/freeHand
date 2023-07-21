import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Popover from "@mui/material/Popover";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import React from 'react';
import format from 'date-fns/format'
// @ts-ignore
import {INotification} from "./index";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

const Notification = ({items, onClick}: {onClick:(e:Event, notification:INotification) => void, items: INotification[] }) => {
  const notReadLength = items.filter(item => !item.is_read).length;
  const handleOpen = (e: any) => {
    setAnchorEl(e.currentTarget);
  }
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  return (
    <>
      <IconButton
        size="large"
        aria-label="Show notifications"
        color="inherit"
        onClick={handleOpen}
      >
        <Badge badgeContent={notReadLength} color="error">
          <NotificationsIcon/>
        </Badge>
      </IconButton>
      <NotificationsList
        onClick={onClick}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        items={items}
      />
    </>
  )
}


const NotificationsList = (
  {items, open, anchorEl, onClose, onClick}:
    { onClick: (e: Event, notification:INotification) => void, onClose: (e: Event) => void, anchorEl: null | HTMLElement, open: boolean, items: INotification[] }
) => {
  const handleClick = (notification: INotification) => (e: any) => {
    onClick(e, notification);
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        sx: {width: '60%', minWidth: "500px"}
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <List>
        {!items.length ? <Box p={2}>No notifications yet</Box> : [items.map((value) => (
          <Box key={value.id} onClick={handleClick(value)}>
            <ListItem
              disablePadding
              sx={{color: !value.is_read ? "inherit" : "gray.main"}}
            >
              <ListItemButton color={"gray"}>
                <ListItemIcon aria-label={'Mark as read'}>
                  {
                    !value.is_read ?
                      <RadioButtonUncheckedIcon color={"primary"}/> :
                      <TaskAltIcon/>
                  }
                </ListItemIcon>
                <ListItemText
                  secondaryTypographyProps={{fontSize: "11px", paddingTop: "10px", alignItems: "right"}}
                  color={"gray"}
                  secondary={format(
                    new Date(value.created_at),
                    'mm/dd/yy'
                  )} primary={value.message}/>
              </ListItemButton>
            </ListItem>
            {value.id !== items[items.length - 1].id && <Divider/>}
          </Box>
        ))]}
      </List>
    </Popover>
  )
}

export default Notification;
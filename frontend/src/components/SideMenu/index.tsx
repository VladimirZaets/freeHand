import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

type SideMenuProps = {
    isOpen: boolean;
    toggleSideMenu: (openState: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function SideMenu({ isOpen, toggleSideMenu }: SideMenuProps) {
  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleSideMenu(false)}
      onKeyDown={toggleSideMenu(false)}
    >
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
                      Categories
          </ListSubheader>
        }
      >
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>            
    </Box>
  );

  return (
    <div>
      <React.Fragment>
        <Drawer
          open={isOpen}
          onClose={toggleSideMenu(false)}
        >
          {list()}
        </Drawer>
      </React.Fragment>
    </div>
  );
}

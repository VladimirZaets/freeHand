import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import { ListItemText } from "@mui/material";

type MenuItemType = {
  text: string
  link: string
};

type MenuItemsType = MenuItemType[];

type MenuPropsType = {
  items: MenuItemsType;
  [otherProp: string]: any;
}

const Menu = ({ items }: MenuPropsType) => {
  return <div className="side-menu">
    <Paper sx={{ width: 320, maxWidth: '100%' }}>
      <MenuList>
        {items.map((item, i) => {
          return (
            <MenuItem key={i}>
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          )
        })}
      </MenuList>
    </Paper>
  </div>
};

export default Menu;
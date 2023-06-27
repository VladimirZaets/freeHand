import React from "react";
import Header from "../Header";
import SideMenu from "../../components/SideMenu";

type HFProps = {
    children: React.ReactNode
}

const HeaderFooter = ({ children }: HFProps) => {
  const [isSideMenuOpen, setSideMenuOpen] = React.useState(false);
  const toggleSideMenu = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setSideMenuOpen(open);
  };

  return <>
    <Header
      toggleSideMenu={toggleSideMenu}
    />
    <SideMenu
      isOpen={isSideMenuOpen}
      toggleSideMenu={toggleSideMenu}
    />
    {children}
    <div className="footer">Footer</div>
  </>
};

export default HeaderFooter;
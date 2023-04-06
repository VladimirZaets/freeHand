import React from "react";

type LayoutProps = {
    menu: React.ReactNode
    content: React.ReactNode
}

const Layout = ({menu, content}: LayoutProps) => {
  return <div className="account-layout">
    <div className="account-menu">{menu}</div>    
    <div className="account-content">{content}</div>
  </div>
};

export default Layout;
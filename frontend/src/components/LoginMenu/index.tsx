import Popover from "@mui/material/Popover";
import React from 'react';
// @ts-ignore
import SigninForm from "../SignInForm";
// @ts-ignore
import {AuthProvidersType} from "../SocialAuthProviders";

import accountRoutes from "../../routes/account/routes";
import authRoutes from "../../routes/auth/routes";
// @ts-ignore
import {SigninHandlerType, ForgotPasswordLinkType, CreateAccountLinkType} from "../SignInForm";

const LoginMenu = ({
  anchorEl,
  onClose,
  onSubmitHandler,
  forgotPasswordLink,
  createAccountLink,
  socialAuthProvidersData
}: {
  createAccountLink:CreateAccountLinkType,
  forgotPasswordLink:ForgotPasswordLinkType,
  onSubmitHandler: SigninHandlerType,
  onClose: (e: React.MouseEvent<HTMLElement>) => void,
  anchorEl: null | HTMLElement,
  socialAuthProvidersData: AuthProvidersType
}) => {
  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      sx={{paddingX: '10px'}}
      PaperProps={{
        sx: {width: '20%', minWidth: "300px", padding: '30px'}
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
      <SigninForm
        forgotPasswordLink={forgotPasswordLink}
        createAccountLink={createAccountLink}
        signinHandler={onSubmitHandler}
        socialAuthProvidersData={socialAuthProvidersData}
      />
    </Popover>
  )
}

export default LoginMenu;
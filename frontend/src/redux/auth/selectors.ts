import {createSelector} from "@reduxjs/toolkit";
//@ts-ignore
import {IAuth} from "./reducer";
import paths from "../../api/paths";
import {FROM_OPTIONS} from "../../components/SocialAuthProviders";

export const getAuthProvidersSelector = createSelector(
  (state: { auth: IAuth }) => state.auth,
  (auth: IAuth) => auth.authProviders
    .filter((provider: string) => provider !== 'local')
    .map((provider: string) => ({
      name: provider,
      url: `${process.env.REACT_APP_API_SERVICE}${paths.auth[provider as keyof typeof paths.auth]}`,
      site: 'freehands',
      from: FROM_OPTIONS.CURRENT,
    }))
)
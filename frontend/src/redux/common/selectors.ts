import {createSelector} from "@reduxjs/toolkit";
//@ts-ignore
import {IinitialState} from "./reducer";

export const getAlertSelector = createSelector(
  (state:{common:IinitialState}) => state.common,
  (common:IinitialState)=>common.alert
)

export const getRedirectSelector = createSelector(
  (state:{common:IinitialState}) => state.common,
  (common:IinitialState)=>common.redirect
)

export const isUserUpdateRequiredSelector = createSelector(
  (state:{common:IinitialState}) => state.common,
  (common:IinitialState)=>common.userUpdateRequired
)
import { createSelector } from '@reduxjs/toolkit';
//@ts-ignore
import { IAccount, UserType } from './reducer';

export const getUserSelector = createSelector(
  (state:{account:IAccount}) => state.account.user,
  (user:UserType)=>user);

export const getNotificationsSelector = createSelector(
  (state:{account:IAccount}) => state.account,
  (account:IAccount)=> [...account.notifications]
    .sort((a, b) =>
      (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime()
    )
);
import { createSelector } from '@reduxjs/toolkit';
import { IAccount, ISignin, IUserRequest } from '../../types/account';

export const getAccountSelector = createSelector((state:{account:IAccount}) => state.account, (account:IAccount)=>account);
export const getAccountSigninSelector = createSelector((state:{account:IAccount}) => state.account.signin, (signin:ISignin)=>signin);
export const getAccountUserSelector = createSelector((state:{account:IAccount}) => state.account.user, (user:IUserRequest)=>user);
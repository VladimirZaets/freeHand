import { createSlice } from '@reduxjs/toolkit'
import { IAccount } from '../../types/account'
import { getUserByToken, getSocialSigninOptions } from './actions';
import { asyncStatuses } from '../status';


const initialState: IAccount = {
  user: {
    request: {
      status: asyncStatuses.initial
    }
  },
  signin: {
    socialOptions: {
      request: {
        status: asyncStatuses.initial, 
      },
      data: []
    }    
  }
  
}

const getUserByTokenCb = (state:IAccount, action:any) => {
  state.user.data = action.payload || null;
  state.user.request.requestId = action.meta.requestId;
  state.user.request.status = action.meta.requestStatus;
}

const getSocialSigninOptionsCb = (state:IAccount, action:any) => {
  state.signin.socialOptions.data = action.payload || null;
  state.signin.socialOptions.request.requestId = action.meta.requestId;
  state.signin.socialOptions.request.status = action.meta.requestStatus;            
}

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserByToken.fulfilled, getUserByTokenCb);
    builder.addCase(getUserByToken.pending, getUserByTokenCb);
    builder.addCase(getSocialSigninOptions.fulfilled, getSocialSigninOptionsCb);
    builder.addCase(getSocialSigninOptions.pending, getSocialSigninOptionsCb);   
  },
})

export default accountSlice.reducer
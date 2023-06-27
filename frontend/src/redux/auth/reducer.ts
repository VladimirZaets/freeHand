import {createSlice} from "@reduxjs/toolkit";
import { signup, getAuthProviders, signoutAsync, signinAsync} from "./actions";
// @ts-ignore
import {IAuth} from "./reducer";

const initialState: IAuth = {
  authProviders: [],
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(signinAsync.fulfilled, signinCb);
    builder.addCase(signoutAsync.fulfilled, signunCb);
    builder.addCase(signup.fulfilled, signoutCb);
    builder.addCase(getAuthProviders.fulfilled, getAuthProvidersCb);
  },
});

const getAuthProvidersCb = (state:IAuth, action:any) => {
  state.authProviders = action.payload || state.authProviders;
}
const signinCb = () => {}
const signunCb = () => {}
const signoutCb = () => {}

export default authSlice.reducer
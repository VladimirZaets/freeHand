import {createSlice} from "@reduxjs/toolkit";
import { signupAsync, getAuthProviders, signoutAsync, signinAsync} from "./actions";
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
    builder.addCase(signupAsync.fulfilled, signoutCb);
    builder.addCase(getAuthProviders.fulfilled, getAuthProvidersCb);
  },
});

const getAuthProvidersCb = (state:IAuth, action:any) => {
  state.authProviders = action.payload?.body || state.authProviders;
}
const signinCb = () => {}
const signunCb = () => {}
const signoutCb = () => {}

export default authSlice.reducer
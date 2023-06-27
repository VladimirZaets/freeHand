import {createAsyncThunk} from "@reduxjs/toolkit";
import paths from "../../api/paths";
//@ts-ignore
import {SigninParams} from "../../components/SignInForm";
import request from "../../api/request";
import {resetUser} from "../account/reducer";
import {getUser} from "../account/actions";
import Localstorage from "../../localstorage";

export const signout = () => {
  return async (dispatch: any) => {
    try {
      await dispatch(signoutAsync());
    } catch (e) {
      return Promise.reject(e);
    }
    dispatch(resetUser());
    Localstorage.removeUser();
  }
}

export const signin = (data: SigninParams) => {
  return async (dispatch: any) => {
    let response:Response;
    try {
      response = await dispatch(signinAsync(data));
    } catch (e) {
      return Promise.reject(e);
    }
    dispatch(getUser())
    return response
  }
}

export const signup = createAsyncThunk(
  paths.auth.signup,
  async (data: SigninParams) => {
    const response = await request.post(paths.auth.signup, data);
    return response.json();
  }
)

export const signinAsync = createAsyncThunk(
  paths.auth.signin,
  async (data: SigninParams) => {
    const response:any = await request.post(paths.auth.signin, data);
    return response.json();
  }
)

export const signoutAsync = createAsyncThunk(
  paths.auth.signout,
  async () => {
    const response:Response = await request.post(paths.auth.signout, {});
    return response.json();
  }
)

export const getAuthProviders = createAsyncThunk(
  paths.auth.providers,
  async () => {
    const response:Response = await request.get(paths.auth.providers);
    return response.json();
  }
)
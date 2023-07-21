import {createAsyncThunk} from "@reduxjs/toolkit";
import paths from "../../api/paths";
//@ts-ignore
import {SigninParams} from "../../components/SignInForm";
//@ts-ignore
import request, {responseType} from "../../api/request";
import {resetUser} from "../account/reducer";
import {getUser} from "../account/actions";
import Localstorage from "../../localstorage";
import {createAlert} from "../common/reducer";

export const signout = () => {
  return async (dispatch: any) => {
    try {
      await dispatch(signoutAsync());
    } catch (e) {
      return Promise.reject(e);
    }
    dispatch(resetUser());
  }
}

export const signin = (data: SigninParams) => {
  return async (dispatch: any) => {
    let response:responseType;
    response = await dispatch(signinAsync(data)).unwrap();
    if (response.ok) {
      dispatch(getUser())
      return Promise.resolve(response)
    }
    return Promise.reject(response);
  }
}

export const signup = (data: SigninParams) => {
  return async (dispatch: any) => {
    let response:responseType;
    response = await dispatch(signupAsync(data)).unwrap();
    if (response.ok) {
      dispatch(createAlert({
        type: 'success',
        message: 'Account is created successfully. Please check your email to verify your account.'
      }));
      dispatch(getUser())
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }
}

export const signupAsync = createAsyncThunk(
  paths.auth.signup,
  async (data: SigninParams) => {
    let response:responseType;
    try {
      response = await request.post(paths.auth.signup, data);
    } catch (e) {
      return e;
    }
    return response;
  }
)

export const signinAsync = createAsyncThunk(
  paths.auth.signin,
  async (data: SigninParams) => {
    let response:responseType;
    try {
      response = await request.post(paths.auth.signin, data);
    } catch (e) {
      return e;
    }
    return response
  }
)

export const signoutAsync = createAsyncThunk(
  paths.auth.signout,
  async () => {
    let response:responseType;
    try {
      response = await request.post(paths.auth.signout, {});
    } catch (e) {
      return e;
    }
    return response;
  }
)

export const getAuthProviders = createAsyncThunk(
  paths.auth.providers,
  async () => {
    let response:responseType;
    try {
      response = await request.get(paths.auth.providers);
    } catch (e) {
      return e;
    }
    return response;
  }
)
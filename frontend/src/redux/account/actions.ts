import {createAsyncThunk} from '@reduxjs/toolkit';
//@ts-ignore
import {CreatePasswordParams} from '../../components/CreatePasswordForm';
import paths from '../../api/paths';
//@ts-ignore
import request, {responseType} from "../../api/request";

// @ts-ignore
import {INotification} from "../../components/Notification";
import Localstorage from "../../localstorage";
import {createAlert} from "../common/reducer";

export const getUser = createAsyncThunk(
  paths.account.user,
  async () => {
    const user = Localstorage.getUser();
    if (user) {
      return Promise.resolve(user);
    }
    const response: responseType = await request.get(paths.account.user)
    if (response.ok) {
      Localstorage.setUser(response.body);
      return response.body;
    }

    return response;
  }
)

export const verifyEmail = (hash: string) => {
  return async (dispatch: any) => {
    let response:responseType;
    response = await dispatch(verifyEmailAsync(hash)).unwrap();
    if (response.ok) {
      dispatch(createAlert({
        type: 'success',
        message: 'Email is verified successfully.'
      }));
      return Promise.resolve(response);
    }
    return Promise.reject(response);
  }
}

export const verifyEmailAsync = createAsyncThunk(
  paths.auth.verifyEmail,
  async (hash: string) => {
    let response:responseType;
    try {
      response = await request.post(paths.auth.verifyEmail, {token: hash});
    } catch (e) {
      return e;
    }
    return response;
  }
)

export const getNotifications = createAsyncThunk(
  paths.account.notifications,
  async () => {
    let response:responseType;
    try {
      response = await request.get(paths.account.notifications);
    } catch (e) {
      return e;
    }
    return response;
  }
)

export const updateNotificationStorage = createAsyncThunk(
  paths.account.notification,
  async (notification: INotification) => {
    let response:responseType;
    try {
      response = await request.put(paths.account.notification, notification)
    } catch (e) {
      return e;
    }
    return response
  }
)

export const createPassword = createAsyncThunk(
  paths.account.password,
  async (data: CreatePasswordParams) => {
    let response:responseType;
    try {
      response = await request.post(paths.account.password, data);
    }  catch (e) {
      return e;
    }
    return response;
  }
)
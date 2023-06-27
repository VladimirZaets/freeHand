import {createAsyncThunk} from '@reduxjs/toolkit';
//@ts-ignore
import {CreatePasswordParams} from '../../components/CreatePasswordForm';
import paths from '../../api/paths';
import request from "../../api/request";

// @ts-ignore
import {INotification} from "../../components/Notification";
import Localstorage from "../../localstorage";

export const getUser = createAsyncThunk(
  paths.account.user,
  async () => {
    const user = Localstorage.getUser();
    if (user) {
      return Promise.resolve(user);
    }
    const response: Response = await request.get(paths.account.user)
    if (response.ok) {
      const user = await response.json();
      Localstorage.setUser(user);
      return user;
    }

    return response.json();
  }
)

export const getNotifications = createAsyncThunk(
  paths.account.notifications,
  async () => {
    const response = await request.get(paths.account.notifications);
    return response.json();
  }
)

export const updateNotificationStorage = createAsyncThunk(
  paths.account.notification,
  async (notification: INotification) => {
    const response: Response = await request.put(paths.account.notification, notification)
    return response.json();
  }
)

export const createPassword = createAsyncThunk(
  paths.account.password,
  async (data: CreatePasswordParams) => {
    const response: Response = await request.post(paths.account.password, data);
    return response.json();
  }
)
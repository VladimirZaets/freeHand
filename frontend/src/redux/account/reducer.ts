import { createSlice } from '@reduxjs/toolkit'
import { getUser, getNotifications, updateNotificationStorage } from './actions';
// @ts-ignore
import { INotification } from '../../components/Notification';
//@ts-ignore
import { IAccount } from './reducer';

const initialState: IAccount = {
  notifications: []
}

const getUserCb = (state:IAccount, action:any) => {
  state.user = action.payload || undefined;
}

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    updateNotification(state, action) {
      state.notifications = [
        ...state.notifications.filter((notification: INotification) => notification.id !== action.payload.id),
        action.payload
      ]
    },
    resetUser(state) {
      state.user = undefined;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, getUserCb);
    builder.addCase(getUser.pending, getUserCb);
    builder.addCase(getNotifications.fulfilled, getNotificationsCb);
    builder.addCase(updateNotificationStorage.fulfilled, updateNotificationStorageCb)
  },
})

const getNotificationsCb = (state:IAccount, action:any) => {
  state.notifications = action.payload || [];
}

const updateNotificationStorageCb = (state:IAccount, action:any) => {
  if (action.payload.response?.error) {
    state.notifications = [
      ...state.notifications.filter((notification: INotification) => notification.id !== action.payload.notification.id),
      action.payload.notification
    ]
  }
  state.notifications = [...state.notifications]
}

export const {
  updateNotification,
  resetUser
} = accountSlice.actions


export default accountSlice.reducer
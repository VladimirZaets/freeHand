import {createSlice} from '@reduxjs/toolkit'
// @ts-ignore
import {IinitialState} from './reducer'

const initialState: IinitialState = {
  isOpenLoadingBackdrop: false,
  redirect: {
    path: '',
    redirect: false
  },
  alert: {
    isOpen: false,
    message: '',
    type: '',
    position: {
      horizontal: 'bottom',
      vertical: 'right'
    },
    duration: 6000
  },
  userUpdateRequired: true
}

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    closeLoadingBackdrop(state) {
      state.isOpenLoadingBackdrop = false
    },
    openLoadingBackdrop(state) {
      console.log(state)
    },
    createAlert(state, action) {
      state.alert = {
        ...state.alert,
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type
      }
    },
    closeAlert(state) {
      state.alert = {
        ...state.alert,
        isOpen: false,
        message: '',
        type: ''
      }
    },
    setRedirect(state, action) {
      state.redirect = action.payload
    },
    resetRedirect(state) {
      state.redirect = {
        path: '',
        redirect: false
      }
    },
    setUserUpdateRequired(state) {
      state.userUpdateRequired = true
    },
    resetUserUpdateRequired(state) {
      state.userUpdateRequired = false
    }
  }
})

export const {
  closeLoadingBackdrop,
  createAlert,
  closeAlert,
  setRedirect,
  resetRedirect,
  setUserUpdateRequired,
  resetUserUpdateRequired
} = commonSlice.actions

export default commonSlice.reducer
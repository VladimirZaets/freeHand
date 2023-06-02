import {createSlice} from '@reduxjs/toolkit'
//import {createNotification} from './actions';

interface INotification {
  isOpen: boolean
  message: any
  type?: string
  duration?: number
  position?: {
    vertical: string
    horizontal: string
  }
}

interface IinitialState {
  isOpenLoadingBackdrop: boolean
  notification: INotification
}

const initialState: IinitialState = {
  isOpenLoadingBackdrop: false,
  notification: {
    isOpen: false,
    message: '',
    type: '',
    position: {
      horizontal: 'bottom',
      vertical: 'right'
    },
    duration: 6000
  }
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
    createNotification(state, action) {
      state.notification = {
        ...state.notification,
        isOpen: true,
        message: action.payload.message,
        type: action.payload.type
      }
    },
    closeNotification(state) {
      state.notification = {
        ...state.notification,
        isOpen: false,
        message: '',
        type: ''
      }
    }
  },
  extraReducers: (builder) => {}
})

export const {
  closeLoadingBackdrop,
  closeNotification,
  createNotification
} = commonSlice.actions
export default commonSlice.reducer
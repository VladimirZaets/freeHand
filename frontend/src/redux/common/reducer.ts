import { createSlice } from '@reduxjs/toolkit'

interface INotification {
  isOpen: boolean
  message: string
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
    type: 'success',
    position: {
      horizontal: 'center',
      vertical: 'top'
    },
    duration: 6000
  }
}

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    openLoadingBackdrop(state) {
      console.log(state)
    },
    closeLoadingBackdrop(state) {
      console.log(state)
    },
    openNotification(state) {
      console.log(state)
    },
    closeNotification(state) {
      console.log(state)
    }
  }  
})

export const { 
  openLoadingBackdrop, 
  closeLoadingBackdrop,
  openNotification,
  closeNotification
} = commonSlice.actions
export default commonSlice.reducer
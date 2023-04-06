import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import accountReducer from './redux/account/reducer';
import commonReducer from './redux/common/reducer'


const store = configureStore({
  reducer: {
    account: accountReducer,
    common: commonReducer
  }  
})


export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
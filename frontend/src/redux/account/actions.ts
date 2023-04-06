import { createAsyncThunk } from '@reduxjs/toolkit';
import { SigninParams } from '../../types/account';
import { formatResponseError } from '../error'
import axios, { AxiosError } from 'axios';

export const getUserByToken = createAsyncThunk(
  'account/getUserByToken',
  async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVICE}/user`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  }
)

export const getSocialSigninOptions = createAsyncThunk(
  'account/getSocialSigninOptions',
  async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_SERVICE}/account/signin/social/options`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response.json()
  },
)

export const signin = createAsyncThunk(
  'account/signin',
  async (data: SigninParams, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;    
    return axios.post(
      `${process.env.REACT_APP_BACKEND_SERVICE}/account/signin`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).catch((error:AxiosError) => {      
      return rejectWithValue(formatResponseError(error));      
    });
  }
)



import { createAsyncThunk } from '@reduxjs/toolkit';
import { SigninParams } from '../../types/account';
import { formatResponseError } from '../error'
import axios, { AxiosError } from 'axios';

export const getUserByToken = createAsyncThunk(
  'api/v1/account/getUserByToken',
  async () => {
    const response = await fetch(`${process.env.REACT_APP_API_SERVICE}/user`, {
      method: "GET",
      credentials: 'include',
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
    const response = await fetch(`${process.env.REACT_APP_API_SERVICE}/account/signin/social/options`, {
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
      `${process.env.REACT_APP_API_SERVICE}/account/signin`,
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



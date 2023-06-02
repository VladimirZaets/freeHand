import {createAsyncThunk} from '@reduxjs/toolkit';
import {CreatePasswordParams, SigninParams} from '../../types/account';
import {formatResponseError} from '../error'
import axios, {AxiosError} from 'axios';

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

export const signup = createAsyncThunk(
  'account/signup',
  async (data: SigninParams, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_SERVICE}/auth/local/callback`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
      return response.json()
    } catch (e) {
      console.log("error", e)
    }
  }
)

export const signin = createAsyncThunk(
  'account/signin',
  async (data: SigninParams, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    return axios.post(
      `${process.env.REACT_APP_API_SERVICE}/account/signin`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).catch((error) => {
      return rejectWithValue(formatResponseError(error));
    });
  }
)

export const createPassword = createAsyncThunk(
  'account/signin',
  async (data: CreatePasswordParams, thunkAPI) => {
    const {rejectWithValue} = thunkAPI;
    return axios.post(
      `${process.env.REACT_APP_API_SERVICE}/account/signin`,
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).catch((error) => {
      return rejectWithValue(formatResponseError(error));
    });
  }
)
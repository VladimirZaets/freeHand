import { RequestInfo } from './redux'

export type UserType = {
    name: string
    avatarUrl: string
}
export type SigninOption = {
    name: string
}

export type SigninOptions = SigninOption[]

export type SigninParams = {
    email: string,
    password: string
    keepSignin?: boolean
}

export type CreatePasswordParams = {
    password: string
}

export type SignupParams = {
    firstname: string,
    lastname: string,
    email: string,
    password: string
    primaryAccountType: string
    dateOfBirth: string
    phone?: string
    city: string
    state: string
    zip: string
}

export interface ISignin {
    socialOptions: ISocialMediaOptionsRequest
}

export interface IAccount {
    user: IUserRequest
    signin: ISignin
}

export interface ISocialMediaOptionsRequest {
    data: SigninOptions
    request: RequestInfo
}

export interface IUserRequest {
    data?: UserType
    request: RequestInfo
}

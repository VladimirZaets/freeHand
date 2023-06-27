// @ts-ignore
import {INotification} from "../../components/Notification";

export type UserType = {
  id: string
  name: string
  avatarUrl: string
}

export interface IAccount {
  user?: UserType
  notifications: INotification[]
}
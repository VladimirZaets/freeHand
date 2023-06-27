//@ts-ignore
import { IAlert } from '../../components/Alert'

interface IRedirect {
  path: string,
  redirect: boolean
}

export interface IinitialState {
  isOpenLoadingBackdrop: boolean
  alert: IAlert
  redirect: IRedirect,
  userUpdateRequired: boolean
}
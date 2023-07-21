export type statusCodeMapType = {[key:number]:(response: any) => void};
export type requestsType = {[key:string]:statusCodeMapType};
export type responseType = {
  ok: boolean,
  status: number,
  body: any
}
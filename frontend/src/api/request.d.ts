export type statusCodeMapType = {[key:number]:(response: any) => void};
export type requestsType = {[key:string]:statusCodeMapType};
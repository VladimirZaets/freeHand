//@ts-ignore
import {statusCodeMapType, requestsType} from "./request";
export const RequestStatusCodes = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  BAD_REQUEST: 400,
}

class Request {
  private apiUrl: string;
  private statusCodeMap: statusCodeMapType;
  private requests: requestsType;

  constructor() {
    this.apiUrl = '';
    this.statusCodeMap = {};
    this.requests = {}
  }


  setApiUrl(apiUrl: string) {
    this.apiUrl = apiUrl
  }

  isUrlExist() {
    if (!this.apiUrl) {
      throw new Error('Api url not set')
    }
  }

  setPerRequestStatusCodeCb(path: string, statusCode: number, cb: (response: any) => void) {
    this.requests[path] = {[statusCode]: cb}
  }

  setDefaultStatusCodeCb(statusCode: number, cb: (response: any) => void) {
    this.statusCodeMap[statusCode] = cb
  }

  executeCallback(path:string, response:Response) {
    if (this.requests[path] && this.requests[path][response.status]) {
      this.requests[path][response.status](response)
    } else if (this.statusCodeMap[response.status]) {
      this.statusCodeMap[response.status](response)
    }
  }

  async get(path: string) {
    this.isUrlExist()
    const response: Response = await fetch(`${this.apiUrl}${path}`, {
      method: "GET",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return response;
    } else {
      this.executeCallback(path, response)
      return response;
    }
  }

  async post(path: string, data: any) {
    this.isUrlExist()
    const response: Response = await fetch(`${this.apiUrl}${path}`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return response;
    } else {
      this.executeCallback(path, response)
      return response;
    }
  }

  async put (path: string, data: any) {
    this.isUrlExist()
    const response: Response = await fetch(`${this.apiUrl}${path}`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return response;
    } else {
      this.executeCallback(path, response)
      return response;
    }
  }

  async delete (path: string) {
    this.isUrlExist()
    const response: Response = await fetch(`${this.apiUrl}${path}`, {
      method: "DELETE",
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return response;
    } else {
      this.executeCallback(path, response)
      return response;
    }
  }
}



const request = new Request();
export default request;
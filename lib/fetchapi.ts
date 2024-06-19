import Cookies from "js-cookie"
import { APIURL } from "@/lib/connection"

const token = Cookies.get("token")
const init: RequestInit = {
   headers: {
      'Content-Type': 'application/json',
      'Authorization': String(token)
   }
}

const controller = new AbortController();

export async function fetch_api(
   method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
   url: string,
   options: { [key:string]: any } = {},
   signal: AbortSignal = controller.signal,
   customHost: string = APIURL
) {
   const params = new URLSearchParams(options?.params).toString()

   const fetching = await fetch(customHost + url + '?' + params, {
      ...init,
      method: method,
      signal,
      ...options
   })

   return { 
      resp: await fetching.json(), 
      status: fetching.status  
   }
}
import Cookies from "js-cookie"
import { APIURL } from "@/lib/connection"

const token = Cookies.get("token")
const init: RequestInit = {
   headers: {
      'Content-Type': 'application/json',
      'Authorization': String(token)
   }
}

export async function load_dokter() {
   const fetchDokter = await fetch(`${APIURL}/rs/dokter`, {
      ...init,
      method: 'GET'
   });
   return fetchDokter.json();
}

export async function load_klinik() {
   const fetchDokter = await fetch(`${APIURL}/rs/klinik`, {
      ...init,
      method: 'GET'
   });
   return fetchDokter.json();
}
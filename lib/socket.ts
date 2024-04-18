import { io } from "socket.io-client";
import { APIURL } from "./connection";

const SERVER = APIURL;

export const socket = io(SERVER, { transports: ["websocket"] });

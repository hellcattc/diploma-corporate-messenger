import { Socket } from "socket.io";
import { verifyToken } from "../config/auth";

export interface AuthenticatedSocket extends Socket {
  userID?: number;
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('no token for socket')
      return next(new Error("Authentication token required"));
    }

    const payload = verifyToken(token);
    socket.userID = payload.userID;
    next();
  } catch (error) {
    console.log('wrong token for socket')
    next(new Error("Invalid authentication token"));
  }
};
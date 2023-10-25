import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { disconnection } from "./utils/socketHandlers.js"


dotenv.config();

export const initializeWebSocketServer = (httpServer) => {
  const io = new Server(httpServer, { /* opciones */ });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return next(new Error("Token has expired"));
        }
        return next(new Error("Invalid token"));
      }

      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user);
    const roomId = `user-${socket.user._id_user}`;
    socket.join(roomId);
    console.log('Room joined:', roomId);

    socket.on('disconnect', () => disconnection(socket));
  });

  return io;
};

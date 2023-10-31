import { Server } from "socket.io";
import dotenv from "dotenv";
import { 
    disconnection, 
    authenticateSocket,
    sendMessage, 
    userTyping
} from "./utils/socketHandlers.js";


dotenv.config();

const handleConnection = (io) => (socket) => {
  console.log('User connected:', socket.user._id_user);
  
  socket.roomsSet = new Set();

  const personalRoomId = `user-${socket.user._id_user}`;
  socket.join(personalRoomId);
  socket.roomsSet.add(personalRoomId);
  console.log('Room joined:', personalRoomId);

  socket.on('sendMessage', (messageData) => sendMessage(io, socket, messageData));
  socket.on('userTyping', (messageData) => userTyping(socket, messageData));
  // socket.on('messageRead', (data) => messageRead(io, socket, messageData));
  socket.on('disconnect', () => disconnection(socket));
};

export const initializeWebSocketServer = (httpServer) => {
  const io = new Server(httpServer, { /* options */ });

  io.use(authenticateSocket);
  io.on('connection', handleConnection(io));

  return io;
};

import jwt from "jsonwebtoken";
import { Message } from "../models/messages.js"
import Sequelize from 'sequelize';

//Event handlers for WebSockets

//Handle authentication
export const authenticateSocket = (socket, next) => {
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
};

//Handle disconnection
export const disconnection = (socket) => {
  console.log('User disconnected:', socket.user._id_user);
  socket.roomsSet.forEach((room) => {
    socket.leave(room);
  });
  socket.roomsSet.clear();
};

//Handle sending a message
export const sendMessage = async (io, socket, messageData) => {
  try {
    const { content, 
            _id_sender, 
            _id_receiver 
          } = messageData;

    if (!_id_sender) {
      return socket.emit("error", "Sender ID not provided");
    }
    if (_id_sender !== socket.user._id_user) {
      return socket.emit("error", "Sender ID does not match authenticated user");
    }
    if (!_id_receiver) {
      return socket.emit("error", "Receiver ID not provided");
    }
    if (!content) {
      return socket.emit("error", "Message content not provided");
    }

    const _id_room = getRoomId(_id_sender, _id_receiver);

    if (!socket.roomsSet.has(_id_room)) {
      socket.join(_id_room);
      socket.roomsSet.add(_id_room);
      console.log(`User ${socket.user._id_user} joined room ${_id_room}`);
    }

    const message = await Message.create({ content, _id_sender, _id_receiver });

    const messageToSend = {
      content: message.content,
      _id_sender: message._id_sender,
      _id_receiver: message._id_receiver,
      createdAt: message.createdAt
    };

    io.to(_id_room).emit('newMessage', messageToSend);

    io.to(`user-${_id_sender}`).emit('updateConversations');
    io.to(`user-${_id_receiver}`).emit('updateConversations');
    
  } catch (error) {
    console.error("An error occurred", error);
    if (error instanceof Sequelize.ValidationError) {
      socket.emit("error", "Validation error");
    } else {
      socket.emit("error", "An unexpected error occurred");
    }
  }
};

//Handle joining a private room
export const getRoomId = (_id_sender, _id_receiver) => {
  if (!_id_sender) {
    throw new Error("Sender ID is missing");
  }
  if (!_id_receiver) {
    throw new Error("Receiver ID is missing");
  }
  const sortedIds = [_id_sender, _id_receiver].sort();
  return `room-${sortedIds[0]}-${sortedIds[1]}`;
};

//Handle notifying a user typing in a private room
export const userTyping = (socket, messageData) => {
  const { _id_sender, _id_receiver } = messageData;

  if (!_id_sender) {
      return socket.emit("error", "Sender ID not provided");
    }
  
  if (!_id_receiver) {
      return socket.emit("error", "Receiver ID not provided");
    }

  const _id_room = getRoomId(_id_sender, _id_receiver);
  
  socket.to(_id_room).emit('userTyping', { _id_user_typing: _id_sender});
};

// Handle joining a conversation
export const joinConversation = (socket, conversationData) => {
  try {
    const { _id_sender, _id_receiver } = conversationData;

    if (!_id_sender) {
      return socket.emit("error", "Sender ID not provided");
    }
    if (_id_sender !== socket.user._id_user) {
      return socket.emit("error", "Sender ID does not match authenticated user");
    }
    if (!_id_receiver) {
      return socket.emit("error", "Receiver ID not provided");
    }

    const _id_room = getRoomId(_id_sender, _id_receiver);

    if (!socket.roomsSet.has(_id_room)) {
      socket.join(_id_room);
      socket.roomsSet.add(_id_room);
      console.log(`User ${socket.user._id_user} joined room ${_id_room}`);
    }
  } catch (error) {
    console.error("An error occurred", error);
    socket.emit("error", "An unexpected error occurred");
  }
};


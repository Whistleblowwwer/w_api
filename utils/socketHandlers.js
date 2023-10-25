//Declare event handlers for WebSockets

//Disconnect from room
export const disconnection = (socket) => {
  console.log('User disconnected:', socket.user);
  const roomId = `user-${socket.user._id_user}`;
  socket.leave(roomId);
  console.log('Left room:', roomId);
};



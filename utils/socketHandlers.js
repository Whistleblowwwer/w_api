//Declare event handlers for WebSockets

//Get Room ID (Helper)
export const getRoomId = (_id_sender, _id_receiver) => {
  const ids = [_id_sender, _id_receiver].sort();
  return `room-${ids[0]}-${ids[1]}`;
}

//Disconnect from room
export const disconnection = (socket) => {
  console.log('User disconnected:', socket.user);
  const _id_room = `user-${socket.user._id_user}`;
  socket.leave(_id_room);
  console.log('Left room:', _id_room);
};


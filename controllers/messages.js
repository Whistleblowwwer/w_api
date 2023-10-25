import { Message } from "../models/messages.js";
import { getRoomId } from "../utils/socketHandlers.js";

//Send Message
export const sendMessage = async (io, socket, messageData) => {
    const { content, _id_sender, _id_receiver} = messageData;
    const _id_room = getRoomId(_id_sender, _id_receiver);

    socket.join(_id_room)

    //Save message in database
    const message = await Message.create({
        content,
        _id_sender,
        _id_receiver,
    });

    io.to(_id_room).emit('newMessage', message);
}
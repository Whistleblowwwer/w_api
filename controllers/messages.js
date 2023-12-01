import { Message } from "../models/messages.js";
import { User } from "../models/users.js";
import { Op } from "sequelize";
import Sequelize from "sequelize";

// Get Messages from a conversation
export const getMessages = async (req, res) => {
  const _id_user = req.user._id_user; 
  const _id_receiver = req.query._id_receiver;

  try {
    const conversation = await Message.findAll({
      where: {
        [Op.or]: [
          { _id_sender: _id_user, _id_receiver }, 
          { _id_sender: _id_receiver, _id_receiver: _id_user } 
        ]
      },
      attributes: {
        include: ['_id_message', 'content', 'is_valid', 'createdAt', 'updatedAt'],
        exclude: ['_id_sender', '_id_receiver'] 
      },
      include: [
        { 
          model: User, 
          as: 'Sender',
          attributes: ['_id_user', 'name', 'last_name']
        },
        { 
          model: User, 
          as: 'Receiver',
          attributes: ['_id_user', 'name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (conversation.length === 0) {
      return res.status(404).send({ message: "No messages found in this conversation." });
    }

    res.status(200).json({
      message: "Messages retrieved successfully.",
      messages: conversation
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ message: "Validation Error", errors: error.errors });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

//Get All Conversations of a user
export const getAllConversations = async (req, res) => {
  const _id_user = req.user._id_user;

  try {
    let allMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { _id_sender: _id_user },
          { _id_receiver: _id_user }
        ]
      },
      attributes: ['_id_message', 'content', 'is_valid', 'createdAt', 'updatedAt', '_id_sender', '_id_receiver'],
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['_id_user', 'name', 'last_name', 'profile_picture_url']
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['_id_user', 'name', 'last_name', 'profile_picture_url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    let conversations = {};
    allMessages.forEach(message => {
      const conversationId = message._id_sender === _id_user ? message._id_receiver : message._id_sender;
      if (!conversations[conversationId] || conversations[conversationId].createdAt < message.createdAt) {
        conversations[conversationId] = {
          Message: {
            _id_message: message._id_message,
            content: message.content,
            is_valid: message.is_valid,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
          },
          Sender: message.Sender,
          Receiver: message.Receiver
        };
      }
    });

    let conversationsArray = Object.values(conversations);

    res.status(200).json({
      message: "Conversations retrieved successfully.",
      conversations: conversationsArray
    });
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ message: "Validation Error", errors: error.errors });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};

// Update a message
export const updateMessage = async (req, res) => {
  const _id_message  = req.query._id_message;
  const { content } = req.body;
  const _id_user = req.user._id_user; 

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const messageToUpdate = await Message.findOne({
      where: { _id_message }
    });

    if (!messageToUpdate) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageToUpdate._id_sender !== _id_user) {
      return res.status(403).json({ message: "You do not have permission to edit this message" });
    }

    messageToUpdate.content = content;
    await messageToUpdate.save();

    res.status(200).json({
      message: "Message updated successfully",
      message: messageToUpdate
    });
  } catch (error) {
    console.error("Error updating message:", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: error.errors.map(err => err.message) 
      });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  const _id_user = req.user._id_user;
  const _id_message  = req.query._id_message;

  try {
    const messageToDelete = await Message.findOne({
      where: { _id_message }
    });

    if (!messageToDelete) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (messageToDelete._id_sender !== _id_user) {
      return res.status(403).json({ message: "You do not have permission to delete this message" });
    }

    messageToDelete.is_valid = false;
    await messageToDelete.save();

    return res.status(200).json({
      message: "Message deleted successfully",
      deleted: true
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: error.errors.map(err => err.message) 
      });
    } else {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

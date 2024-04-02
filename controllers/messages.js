import { Message } from "../models/messages.js";
import { User } from "../models/users.js";
import { UserFollowers } from "../models/userFollowers.js";
import { Op } from "sequelize";
import Sequelize from "sequelize";

// Get Messages from a conversation
export const getMessages = async (req, res) => {
  const _id_user = req.user._id_user;
  const _id_receiver = req.query._id_receiver;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { _id_sender: _id_user, _id_receiver: _id_receiver },
          { _id_sender: _id_receiver, _id_receiver: _id_user }
        ]
      },
      attributes: ['_id_message', 'content', '_id_sender', '_id_receiver', 'createdAt', 'is_read'],
      order: [['createdAt', 'DESC']]
    });

    if (messages.length === 0) {
      return res.status(404).send({ message: "No messages found in this conversation." });
    }

    const unreadMessagesIds = messages
      .filter(message => message._id_sender === _id_receiver && !message.is_read)
      .map(message => message._id_message);

    if (unreadMessagesIds.length > 0) {
      await Message.update({ is_read: true }, {
        where: { _id_message: unreadMessagesIds }
      });
    }

    res.status(200).json({
      message: "Messages retrieved successfully.",
      messages: messages
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
      attributes: ['_id_message', 'content', 'is_valid', 'createdAt', 'updatedAt', '_id_sender', '_id_receiver', 'is_read'],
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['_id_user', 'name', 'last_name', 'profile_picture_url'],
          where: { is_valid: true }
        },
        {
          model: User,
          as: 'Receiver',
          attributes: ['_id_user', 'name', 'last_name', 'profile_picture_url'],
          where: { is_valid: true }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    let conversations = {};
    allMessages.forEach(message => {
      const conversationId = message._id_sender === _id_user ? message._id_receiver : message._id_sender;
      if (!conversations[conversationId]) {
        conversations[conversationId] = {
          Message: {
            _id_message: message._id_message,
            content: message.content,
            is_valid: message.is_valid,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
          },
          Sender: message.Sender,
          Receiver: message.Receiver,
          is_read: true 
        };
      }

      if (message._id_sender !== _id_user && !message.is_read) {
        conversations[conversationId].is_read = false;
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

//Get a users list for starting a new conversation
export const getConversationStarterUserList = async (req, res) => {
  const _id_user = req.user._id_user;

  try {
    const followedUsersList = await UserFollowers.findAll({
      attributes: ['_id_followed'],
      where: { _id_follower: _id_user }
    });

    const followedUserIds = followedUsersList.map(followed => followed._id_followed);

    const followedUsersDetails = await User.findAll({
      where: { _id_user: followedUserIds },
      attributes: ['_id_user', 'name', 'last_name', 'nick_name', 'profile_picture_url'],
    });

    const followedUsersWithStatus = followedUsersDetails.map(user => ({ 
      ...user.get({ plain: true }), 
      followed: true 
    }));

    const additionalUsers = await User.findAll({
      where: { 
        _id_user: { [Sequelize.Op.notIn]: followedUserIds }
      },
      attributes: ['_id_user', 'name', 'last_name', 'nick_name', 'profile_picture_url'],
      limit: 30
    });

    const additionalUsersWithStatus = additionalUsers.map(user => ({ 
      ...user.get({ plain: true }), 
      followed: false 
    }));

    const combinedUserList = [...followedUsersWithStatus, ...additionalUsersWithStatus];

    res.json(combinedUserList);

  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      res.status(500).send({ message: "Database error occurred", details: error.message });
    } else if (error instanceof Error) {
      res.status(500).send({ message: "An error occurred", details: error.message });
    } else {
      res.status(500).send({ message: "Unexpected error occurred" });
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

//Delete a conversation with someone
export const deleteConversation = async (req, res) => {
  const _id_user = req.user._id_user; 
  const _id_receiver = req.query._id_receiver; 

  try {
    const deletionResult = await Message.destroy({
      where: {
        [Op.or]: [
          { _id_sender: _id_user, _id_receiver: _id_receiver },
          { _id_sender: _id_receiver, _id_receiver: _id_user }
        ]
      }
    });

    if (deletionResult === 0) {
      return res.status(404).send({ message: "No conversation found between these users." });
    }

    res.status(200).send({ message: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    if (error instanceof Sequelize.ValidationError) {
      return res.status(400).send({ message: "Validation Error", errors: error.errors });
    } else {
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
};


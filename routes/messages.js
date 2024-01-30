import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    getMessages,
    getAllConversations,
    getConversationStarterUserList,
    updateMessage,
    deleteMessage,
} from "../controllers/messages.js";

const router = Router();

// //----------Messages Routes-------------

// Get Messages from a conversation
router.get("/", validateUser, getMessages);

//Get All Conversations of a User
router.get("/conversations", validateUser, getAllConversations);

//Get a users list for starting a new conversation
router.get("/users-list", validateUser, getConversationStarterUserList);

// Update message
router.put("/", validateUser, updateMessage);

// Delete message
router.patch("/", validateUser, deleteMessage);

export default router;

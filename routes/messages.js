import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { 
    getMessages,
    getAllConversations, 
    getConversationStarterUserList,
    updateMessage,
    deleteMessage    
} from "../controllers/messages.js";

const router = Router();

// //----------Messages Routes-------------

// Get Messages from a conversation
router.get('/', validateToken, getMessages); 

//Get All Conversations of a User
router.get('/conversations', validateToken, getAllConversations)

//Get a users list for starting a new conversation
router.get('/users-list', validateToken, getConversationStarterUserList)

// Update message
router.put('/', validateToken, updateMessage);

// Delete message
router.patch('/', validateToken, deleteMessage);

export default router;


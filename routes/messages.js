import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { 
    getMessages,
    updateMessage,
    deleteMessage    
} from "../controllers/messages.js";

const router = Router();

// //----------Messages Routes-------------

// Get Messages from a conversation
router.get('/:_id_receiver', validateToken, getMessages); 

// Update message
router.put('/:_id_message', validateToken, updateMessage);

// Delete message
router.patch('/:_id_message', validateToken, deleteMessage);

export default router;


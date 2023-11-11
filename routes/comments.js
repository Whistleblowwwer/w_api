import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { 
    getCommentChildren,
    createComment,
    updateComment,
    deactivateComment
} from "../controllers/comments.js";

const router = Router();

//----------Comments Routes-------------

//Get Comment Children
router.get('/children', validateToken, getCommentChildren)

//Create Comment
router.post('/', validateToken, createComment);

//Update Comment
router.put('/', validateToken, updateComment);

//Delete Comment
router.patch('/', validateToken, deactivateComment);

export default router;
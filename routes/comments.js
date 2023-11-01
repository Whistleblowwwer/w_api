import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { 
    createComment
} from "../controllers/comments.js";

const router = Router();

//----------Comments Routes-------------

//Create Comment
router.post('/', validateToken, createComment);

export default router;
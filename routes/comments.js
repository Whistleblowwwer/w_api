import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    getCommentChildren,
    createComment,
    updateComment,
    deactivateComment,
    getCommentUserLikes,
    getCommentUserComments,
} from "../controllers/comments.js";

const router = Router();

//----------Comments Routes-------------

//Get Comment Children
router.get("/children", validateUser, getCommentChildren);

//Create Comment
router.post("/", validateUser, createComment);

//Update Comment
router.put("/", validateUser, updateComment);

//Delete Comment
router.patch("/", validateUser, deactivateComment);

// Route to get users who liked a review
router.get("/:commentId/likes", validateUser, getCommentUserLikes);

// Route to get users who commented on a review
router.get("/:commentId/comments", validateUser, getCommentUserComments);

export default router;

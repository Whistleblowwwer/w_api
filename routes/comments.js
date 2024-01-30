import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    getCommentChildren,
    createComment,
    updateComment,
    deactivateComment,
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

export default router;

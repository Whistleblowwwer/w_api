import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    CreateFeedItem,
    ReadFeedItem,
    UpdateFeedItem,
    DeleteFeedItem,
} from "../controllers/feedItems.js";

const router = Router();

//----------FeedItems Routes-------------

//Create FeedItem
router.post("/", validateUser, CreateFeedItem);

//Read FeedItem
router.get("/", validateUser, ReadFeedItem);

//Update FeedItem
router.put("/", validateUser, UpdateFeedItem);

//Delete FeedItem
router.delete("/", validateUser, DeleteFeedItem);

export default router;

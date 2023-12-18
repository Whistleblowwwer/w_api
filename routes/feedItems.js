import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { CreateFeedItem, ReadFeedItem, UpdateFeedItem, DeleteFeedItem} from "../controllers/feedItems.js";

const router = Router();

//----------FeedItems Routes-------------

//Create FeedItem
router.post('/',validateToken, CreateFeedItem)

//Read FeedItem
router.get('/',validateToken, ReadFeedItem);

//Update FeedItem
router.put('/',validateToken, UpdateFeedItem);

//Delete FeedItem
router.delete('/',validateToken, DeleteFeedItem);

export default router;
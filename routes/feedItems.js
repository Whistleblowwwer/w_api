import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { CreateFeedItem, ReadFeedItem, UpdateFeedItem, DeleteFeedItem} from "../controllers/feedItems.js";

const router = Router();

//----------FeedItems Routes-------------

//Create FeedItem
router.post('/', CreateFeedItem)

//Read FeedItem
router.get('/', ReadFeedItem);

//Update FeedItem
router.put('/', UpdateFeedItem);

//Delete FeedItem
router.delete('/', DeleteFeedItem);

export default router;
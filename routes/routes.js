import FeedItemsRoute from "./feedItems.js";
import businessRoute from "./business.js";
import messageRoute from "./messages.js";
import commentRoute from "./comments.js";
import articleRoute from "./articles.js";
import BrokersRoute from "./brokers.js";
import reviewRoute from "./reviews.js";
import bucketRoute from "./bucket.js";
import userRoute from "./users.js";
import { Router } from "express";

const router = Router();

// Main Routes
router.use("/feeditems", FeedItemsRoute);
router.use("/business", businessRoute);
router.use("/messages", messageRoute);
router.use("/comments", commentRoute);
router.use("/articles", articleRoute);
router.use("/brokers", BrokersRoute);
router.use("/reviews", reviewRoute);
router.use("/bucket", bucketRoute);
router.use("/users", userRoute);

// Health Check Route
router.get("/", (req, res) => {
    res.status(200).json({
        message: "Node.js/Sequelize project is up and running.",
    });
});

export default router;

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

// Subscription Confirmation Route
router.post("/sns-subscription-confirmation", (req, res) => {
    const snsMessage = req.body;
    if (snsMessage && snsMessage.Type === "SubscriptionConfirmation") {
        // Confirm the subscription by making a GET request to the SubscribeURL
        // AWS will send a confirmation URL in the SubscribeURL field of the SNS message
        const subscribeURL = snsMessage.SubscribeURL;
        // You might want to use a library like axios or node-fetch to make the request
        // Example using axios:
        axios
            .get(subscribeURL)
            .then(() => {
                res.status(200).json({
                    message: "Subscription confirmed successfully.",
                });
            })
            .catch((error) => {
                console.error("Error confirming subscription:", error);
                res.status(500).json({
                    message: "Error confirming subscription.",
                });
            });
    } else {
        res.status(400).json({
            message: "Invalid SNS message.",
        });
    }
});

export default router;

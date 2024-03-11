import { validateUser } from "../middlewares/ClientValidations.js";
import { getIpInfo } from "../middlewares/ClientValidations.js";
import FeedItemsRoute from "./feedItems.js";
import businessRoute from "./business.js";
import messageRoute from "./messages.js";
import commentRoute from "./comments.js";
import articleRoute from "./articles.js";
import BrokersRoute from "./brokers.js";
import reviewRoute from "./reviews.js";
import bucketRoute from "./bucket.js";
import userRoute from "./users.js";
import adminRoute from "./admins.js";
import { Router } from "express";
import adRoute from "./ads.js";

const router = Router();

// Middlewares for Ip address validation
router.use(getIpInfo);

// Main Routes
router.use("/feeditems", FeedItemsRoute);
router.use("/business", businessRoute);
router.use("/messages", messageRoute);
router.use("/comments", commentRoute);
router.use("/articles", articleRoute);
router.use("/brokers", BrokersRoute);
router.use("/reviews", reviewRoute);
router.use("/bucket", bucketRoute);
router.use("/admins", adminRoute);
router.use("/users", userRoute);
router.use("/ads", adRoute);

// Subscription Confirmation Route
router.post("/sns-subscription-confirmation", (req, res) => {
    const snsMessageBody = req.body;
    const snsMessageParams = req.params;
    const snsMessage = req.params;
    console.log("\n-- SNS BODY:", snsMessageBody);
    console.log("\n-- SNS PARAMS:", snsMessageParams);
    console.log("\n-- SNS REQUEST:", snsMessage);
    res.status(200).json({
        message: "Subscription confirmation received. No further action taken.",
    });
});

// Catch-all middleware for handling non-existent routes
router.use(validateUser, (req, res) => {
    const _id_user = req.user._id_user;
    req.requestDTO._id_user = _id_user;

    console.error("Non-existent route:", req.originalUrl);

    req.requestDTO.errorLog("Invalid route");
    res.status(404).json({ message: "Route not found" });
});

export default router;

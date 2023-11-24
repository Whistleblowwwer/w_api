import businessRoute from "./business.js";
import messageRoute from "./messages.js";
import commentRoute from "./comments.js";
import articleRoute from "./articles.js";
import reviewRoute from "./reviews.js";
import bucketRoute from "./bucket.js";
import userRoute from "./users.js";
import { Router } from "express";

const router = Router();

// Main Routes
router.use("/business", businessRoute);
router.use("/messages", messageRoute);
router.use("/comments", commentRoute);
router.use("/articles", articleRoute);
router.use("/reviews", reviewRoute);
router.use("/bucket", bucketRoute);
router.use("/users", userRoute);

export default router;

import { Router } from "express";
import userRoute from "./users.js";
import businessRoute from "./business.js";
import reviewRoute from "./reviews.js";
import commentRoute from "./comments.js";
import messageRoute from "./messages.js";

const router = Router();

// Main Routes
router.use("/users", userRoute);
router.use("/business", businessRoute);
router.use("/reviews", reviewRoute);
router.use("/comments", commentRoute);
router.use("/messages", messageRoute);

export default router;

import { Router } from "express";
import userRoute from "./users.js";
import bucketRoute from "./bucket.js";
import businessRoute from "./business.js";
import reviewRoute from "./reviews.js";

const router = Router();

// Main Routes
router.use("/users", userRoute);
router.use("/bucket", bucketRoute);
router.use("/business", businessRoute);
router.use("/reviews", reviewRoute);

export default router;

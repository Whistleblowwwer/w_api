import { Router } from "express";
import userRoute from "./users.js";
import businessRoute from "./business.js";
import reviewRoute from "./reviews.js";

const router = Router();

// Main Routes
router.use("/users", userRoute);
router.use("/business", businessRoute)
router.use("/reviews", reviewRoute)

export default router;

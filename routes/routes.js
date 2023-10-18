import { Router } from "express";
import userRoute from "./users.js";
import bucketRoute from "./bucket.js";

const router = Router();

// Main Routes
router.use("/users", userRoute);
router.use("/bucket", bucketRoute);

export default router;

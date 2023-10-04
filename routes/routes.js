import { Router } from "express";
import userRoute from "./users.js";

const router = Router();

// Main Routes
router.use("/users", userRoute);

export default router;

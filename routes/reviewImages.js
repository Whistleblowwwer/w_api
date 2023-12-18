import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import {
    createReview,
} from "../controllers/reviews.js";

const router = Router();

//----------Reviews Images Routes-------------

// Get Review Image
router.get("/", validateToken, createReview);

export default router;

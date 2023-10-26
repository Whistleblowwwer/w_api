import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { createReview } from "../controllers/reviews.js";

const router = Router();

//----------Reviews Routes-------------

//Create Review
router.post("/", validateToken, createReview);

export default router;

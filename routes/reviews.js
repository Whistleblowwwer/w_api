import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import {
    createReview,
    getReview,
    getReviewsForBusiness,
    updateReview,
    deleteReview,
} from "../controllers/reviews.js";

const router = Router();

//----------Reviews Routes-------------

// Create Review
router.post("/", validateToken, createReview);

// Get Review
router.get("/:_id_review", validateToken, getReview);

// Get Reviews of a Business
router.get("/business/:_id_business", validateToken, getReviewsForBusiness);

// Update Review
router.put("/", validateToken, updateReview);

// Delete Review
router.patch("/", validateToken, deleteReview);

// Get all reviews
router.get("/", validateToken, getAllReviews);

export default router;

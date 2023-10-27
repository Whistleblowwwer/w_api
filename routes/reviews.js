import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import {
    createReview,
    getAllReviews, 
    getReview,
    getReviewsForBusiness,
    updateReview,
    deleteReview,
    getAllReviews,
} from "../controllers/reviews.js";

const router = Router();

//----------Reviews Routes-------------

// Create Review
router.post("/", validateToken, createReview);

// Get all reviews 
router.get('/', validateToken, getAllReviews);

// Get Review (with comments)
router.get('/:_id_review', validateToken, getReview);

// Get Reviews of a Business
router.get("/business/:_id_business", validateToken, getReviewsForBusiness);

// Update Review
router.put("/", validateToken, updateReview);

// Delete Review
router.patch("/", validateToken, deleteReview);

export default router;

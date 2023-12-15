import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import {
    createReview,
    getAllReviews,
    getReviewParent,
    getReviewChildren,
    getReviewsForBusiness,
    getUserReviews,
    updateReview,
    deleteReview,
    getUserLikedReviews
} from "../controllers/reviews.js";

const router = Router();

//----------Reviews Routes-------------

// Create Review
router.post("/", validateToken, createReview);

// Get all reviews
router.get("/", validateToken, getAllReviews);

// Get Review (with only parent comments)
router.get("/info", validateToken, getReviewParent);

// Get Review (with comments and children)
router.get("/info/thread", validateToken, getReviewChildren);

// Get Reviews of a Business
router.get("/business", validateToken, getReviewsForBusiness);

//Get Reviews of a User
router.get("/my-reviews", validateToken, getUserReviews);

//Get Reviews Liked by a User
router.get("/liked", validateToken, getUserLikedReviews);

// Update Review
router.put("/", validateToken, updateReview);

// Delete Review
router.patch("/", validateToken, deleteReview);

export default router;

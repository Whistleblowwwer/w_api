import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    createReview,
    getAllReviews,
    getReviewParent,
    getReviewChildren,
    getReviewsForBusiness,
    updateReview,
    deleteReview,
    getUserLikedReviews,
} from "../controllers/reviews.js";

const router = Router();

//----------Reviews Routes-------------

// Create Review
router.post("/", validateUser, createReview);

// Get all reviews
router.get("/", validateUser, getAllReviews);

// Get Review (with only parent comments)
router.get("/info", validateUser, getReviewParent);

// Get Review (with comments and children)
router.get("/info/thread", validateUser, getReviewChildren);

// Get Reviews of a Business
router.get("/business", validateUser, getReviewsForBusiness);

//Get Reviews Liked by a User
router.get("/liked", validateUser, getUserLikedReviews);

// Update Review
router.put("/", validateUser, updateReview);

// Delete Review
router.patch("/", validateUser, deleteReview);

export default router;

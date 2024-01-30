import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import { createReview } from "../controllers/reviews.js";

const router = Router();

//----------Reviews Images Routes-------------

// Get Review Image
router.get("/", validateUser, createReview);

export default router;

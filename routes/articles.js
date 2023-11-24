import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { createArticle, getAllArticles } from "../controllers/articles.js";

const router = Router();

//----------Articles Routes-------------

// Create Article
router.post("/", validateToken, createArticle);
router.get("/", validateToken, getAllArticles);

export default router;

import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    createArticle,
    getAllArticles,
    getArticleById,
} from "../controllers/articles.js";

const router = Router();

//----------Articles Routes-------------

// Create Article
router.post("/", validateToken, createArticle);

// Get All Articles
router.get("/", validateToken, getAllArticles);

// Get Article by ID
router.get("/:articleId", validateToken, getArticleById);

export default router;

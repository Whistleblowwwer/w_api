import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    createArticle,
    getAllArticles,
    getArticleById,
} from "../controllers/articles.js";

const router = Router();

//----------Articles Routes-------------

// Create Article
router.post("/", validateUser, createArticle);

// Get All Articles
router.get("/", validateUser, getAllArticles);

// Get Article by ID
router.get("/:articleId", validateUser, getArticleById);

export default router;

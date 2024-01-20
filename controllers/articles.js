// Import your modules and models as needed
import { Article } from "../models/articles.js";
import { Category } from "../models/categories.js";
import { User } from "../models/users.js";

export const createArticle = async (req, res) => {
    const _id_user = req.user._id_user;
    const user = await User.findByPk(_id_user);

    try {
        // Check if the user is an admin
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Permission denied. Only admins can create articles.",
            });
        }

        // Extract data from req.body
        const {
            title,
            content,
            subtitle,
            published_at,
            is_published,
            _id_category,
        } = req.body;

        // Create the article without processing markdown
        const createdArticle = await Article.create({
            title,
            content,
            subtitle,
            published_at,
            is_published,
            _id_user,
            _id_category,
        });

        return res.status(201).json({
            message: "Article created successfully",
            article: createdArticle,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.findAll({
            include: [
                { model: User, attributes: ["name", "email"], as: "Author" },
                // Add other includes as needed
            ],
        });

        // Send raw markdown content without processing
        const articlesWithoutProcessing = articles.map((article) =>
            article.toJSON()
        );

        return res.status(200).json(articlesWithoutProcessing);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getArticleById = async (req, res) => {
    const articleId = req.params.articleId;

    try {
        const article = await Article.findByPk(articleId, {
            include: [
                { model: User, attributes: ["name", "email"], as: "Author" },
                { model: Category, attributes: ["name"] },
            ],
        });

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Send raw markdown content without processing
        const parsedArticle = article.toJSON();

        return res.status(200).json(parsedArticle);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

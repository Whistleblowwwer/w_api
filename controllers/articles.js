import { Article } from "../models/articles.js";
import { User } from "../models/users.js";

export const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.findAll({
            include: [
                { model: User, attributes: ["name", "email"] },
                { model: Category, attributes: ["name"] },
            ],
        });
        return res.status(200).json(articles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

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
        const { title, content, published_at, is_published, _id_category } =
            req.body;

        // Create the article
        const createdArticle = await Article.create({
            title,
            content,
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

import { Comment } from "../models/comments.js";

export const getNestedComments = async () => {
    try {
        const allComments = await Comment.findAll({
            where: { is_valid: true },
            include: [
                { model: Comment, as: "children" },
                { model: Comment, as: "parent" },
            ],
        });
    } catch (error) {
        console.error("Error updating nicknames:", error);
        throw error;
    }
};

getNestedComments();

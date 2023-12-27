import { Comment } from "../models/comments.js";
import { User } from "../models/users.js";

export const getNestedComments = async () => {
    try {
        // Fetch all comments
        console.log("\n -- ASSOCIATIONS: ", Object.keys(Comment.associations));
        console.log(
            "\n -- USER ASSOCIATIONS: ",
            Object.keys(User.associations)
        );
        const allComments = await Comment.findAll({
            where: { is_valid: true },
            include: [
                { model: Comment, as: "children" },
                { model: Comment, as: "parent" },
            ],
        });
        console.log(allComments);
    } catch (error) {
        console.error("Error updating nicknames:", error);
        throw error;
    }
};

getNestedComments();

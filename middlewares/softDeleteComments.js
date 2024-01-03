import { sequelize_write } from "../config/db_write.js";
import { Comment } from "../models/comments.js";

export async function softDeleteCommentAndChildren(commentId) {
    let transaction;

    try {
        // Start a Sequelize transaction
        console.log("\n -- TRANSACTION: ");
        transaction = await sequelize.transaction();

        // Retrieve all children of the comment
        const children = await Comment.findAll({
            where: { _id_parent: commentId },
            transaction,
        });

        // Recursively soft delete each child
        await Promise.all(
            children.map(async (child) => {
                await softDeleteCommentAndChildren(child._id_comment);
            })
        );

        // Soft delete the comment itself
        await Comment.update(
            { is_valid: false },
            { where: { _id_comment: commentId }, transaction }
        );

        // Commit the transaction
        await transaction.commit();
    } catch (error) {
        // If an error occurs, rollback the transaction
        if (transaction) await transaction.rollback();

        // Handle or log the error as needed
        console.error("Error in softDeleteCommentAndChildren:", error.message);
    }
}

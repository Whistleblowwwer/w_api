import { Sequelize } from "sequelize";
import { User } from "../models/users.js";
import { Comment } from "../models/comments.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { InteractionsDTO } from "../models/dto/interactions_dto.js";

export const commentsMetaData = async (reviews) => {
    const commentsData = await Promise.all(
        reviews.map(async (review) => {
            const comments = await Comment.findAll({
                where: { _id_review: review._id_review, is_valid: true },
                order: [["createdAt", "DESC"]],
                include: [
                    {
                        model: User,
                        attributes: [
                            "_id_user",
                            "name",
                            "last_name",
                            "nick_name",
                        ],
                        as: "User",
                    },
                ],
            });

            return {
                _id_review: review._id_review,
                comments,
            };
        })
    );

    return commentsData;
};

export const likesMetaData = async (reviews, userID) => {
    try {
        const reviewIds = reviews.map((review) => review._id_review);

        const likesMetaDataForReviews = await ReviewLikes.findAll({
            attributes: [
                "_id_review",
                [
                    Sequelize.fn("COUNT", Sequelize.col("_id_review")),
                    "likeCount",
                ],
                [
                    Sequelize.fn(
                        "SUM",
                        Sequelize.literal(
                            `CASE WHEN _id_user = '${userID}' THEN 1 ELSE 0 END`
                        )
                    ),
                    "userLiked",
                ],
            ],
            where: { _id_review: { [Sequelize.Op.in]: reviewIds } },
            group: ["_id_review"],
        });

        return likesMetaDataForReviews;
    } catch (error) {
        console.error("Error getting likes metadata for reviews:", error);
        throw error;
    }
};

export const createInteractionsDTO = async (reviews, userID) => {
    const interactionsDTO = new InteractionsDTO();

    const commentsForReviews = await commentsMetaData(reviews);
    const likesForReviews = await likesMetaData(reviews, userID);

    interactionsDTO.setComments(commentsForReviews);
    interactionsDTO.setLikes(likesForReviews);

    return interactionsDTO.getDTO();
};

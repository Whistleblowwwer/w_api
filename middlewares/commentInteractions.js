import { Sequelize } from "sequelize";
import { Comment } from "../models/comments.js";
import { CommentLikes } from "../models/commentLikes.js";
import { InteractionsDTO } from "../models/dto/interactions_dto.js";

export const commentMetaData = async (comments, userID) => {
    const commentIds = comments.map(comment => comment._id_comment);

    const likesMetaDataForComments = await CommentLikes.findAll({
        attributes: [
            "_id_comment",
            [Sequelize.fn("COUNT", Sequelize.col("_id_comment")), "likeCount"],
            [
                Sequelize.fn(
                    "SUM",
                    Sequelize.literal(`CASE WHEN _id_user = '${userID}' THEN 1 ELSE 0 END`)
                ),
                "userLiked",
            ],
        ],
        where: { _id_comment: { [Sequelize.Op.in]: commentIds } },
        group: ["_id_comment"],
    });

    const repliesCountForComments = await Comment.findAll({
        attributes: [
            "_id_parent",
            [Sequelize.fn("COUNT", Sequelize.col("_id_parent")), "repliesCount"],
        ],
        where: { _id_parent: { [Sequelize.Op.in]: commentIds } },
        group: ["_id_parent"],
    });

    return { likesMetaDataForComments, repliesCountForComments };
};


export const createCommentInteractionsDTO = async (comments, userID) => {
    const interactionsDTO = new InteractionsDTO();

    const { likesMetaDataForComments, repliesCountForComments } = await commentMetaData(comments, userID);

    interactionsDTO.setLikes(likesMetaDataForComments);
    interactionsDTO.setComments(repliesCountForComments);

    return interactionsDTO.getDTO();
};


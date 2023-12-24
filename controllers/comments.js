import { Sequelize, where } from "sequelize";
import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { CommentLikes } from "../models/commentLikes.js";
import { UserFollowers } from "../models/userFollowers.js";

//Get Comment Children
export const getCommentChildren = async (req, res) => {
    const _id_user = req.user._id_user;
    const _id_comment = req.query._id_comment;

    if (!_id_comment) {
        return res.status(400).json({ message: "Comment ID is required" });
    }

    try {
        const comment = await Comment.findByPk(_id_comment, {
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                      SELECT COUNT(*)
                      FROM "commentLikes" AS commentLikes
                      WHERE
                      commentLikes."_id_comment" = "Comment"."_id_comment"
                    )`),
                        "likes",
                    ],
                    [
                        Sequelize.literal(`(
                      SELECT COUNT(*)
                      FROM "comments" as Comments
                      WHERE
                      Comments._id_comment = "Comment"."_id_comment"
                  )`),
                        "comments",
                    ],
                ],
            },
            include: [
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                    as: "User",
                },
                {
                    model: Comment,
                    as: "Children",
                    where: { _id_parent: _id_comment },
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ["_id_user", "name", "last_name"],
                            as: "User",
                        },
                    ],
                    attributes: {
                        include: [
                            [
                                Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM "commentLikes" AS commentLikes
                                WHERE
                                commentLikes."_id_comment" = "Children"."_id_comment"
                            )`),
                                "likes",
                            ],
                            [
                                Sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM Comments as "children"
                                WHERE
                                "children"."_id_parent" = "Children"."_id_comment"
                            )`),
                                "comments",
                            ],
                        ],
                    },
                },
            ],
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const userLikedComment = await CommentLikes.findOne({
            where: {
                _id_comment,
                _id_user,
            },
        });

        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user },
        }).then(
            (followings) =>
                new Set(followings.map((following) => following._id_followed))
        );

        // Retrieve liked comments for the user
        const userLikedComments = await CommentLikes.findAll({
            where: {
                _id_comment: {
                    [Sequelize.Op.in]: comment.Children.map(
                        (comment) => comment._id_comment
                    ),
                },
                _id_user,
            },
        });

        // Create a set of liked comment IDs
        const likedCommentsSet = new Set(
            userLikedComments.map((like) => like._id_comment)
        );

        const transformedComments = comment.Children.map((childComment) => ({
            _id_comment: childComment._id_comment,
            content: childComment.content,
            is_valid: childComment.is_valid,
            createdAt: childComment.createdAt,
            updatedAt: childComment.updatedAt,
            _id_business: childComment._id_business,
            _id_user: childComment._id_user,
            _id_review: childComment._id_review,
            is_liked: likedCommentsSet.has(childComment._id_comment),
            likes: childComment.getDataValue("likes"),
            comments: childComment.getDataValue("comments"),
            User: {
                ...childComment.User.get({ plain: true }),
                is_followed: userFollowings.has(childComment.User._id_user),
            },
        }));

        const commentData = {
            _id_comment: comment._id_comment,
            content: comment.content,
            is_valid: comment.is_valid,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            _id_business: comment._id_business,
            _id_user: comment._id_user,
            is_liked: !!userLikedComment,
            likes: comment.getDataValue("likes"),
            comments: comment.getDataValue("comments"),
            User: {
                ...comment.User.get({ plain: true }),
                is_followed: userFollowings.has(comment.User._id_user),
            },
            Comments: transformedComments,
        };

        res.status(200).json({
            message: "Comments retrieved successfully",
            comment: commentData,
        });
    } catch (error) {
        console.error("Error finding comments:", error);
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors.map((err) => err.message),
            });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

//Create Comment
export const createComment = async (req, res) => {
    try {
        const { content, _id_review, _id_parent } = req.body;
        const _id_user = req.user._id_user;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required" });
        }

        if (!_id_review) {
            return res.status(400).json({ message: "Review ID is required" });
        }

        const parentReview = await Review.findByPk(_id_review);

        if (!parentReview || !parentReview.is_valid) {
            return res.status(404).json({ message: "Review not found" });
        }

        // if (!parentReview.is_valid) {
        //     return res.status(400).json({ message: "Invalid review" });
        // }

        const createdComment = await Comment.create({
            content,
            _id_review,
            _id_user,
            _id_parent: _id_parent || null,
        });

        const userCreatingComment = await User.findByPk(_id_user);

        const commentData = {
            _id_comment: createdComment._id_comment,
            content: createdComment.content,
            is_valid: createdComment.is_valid,
            createdAt: createdComment.createdAt,
            updatedAt: createdComment.updatedAt,
            _id_review: createdComment._id_review,
            _id_parent: createdComment._id_parent,
            is_liked: false,
            likes: "0",
            comments: "0",
            User: {
                _id_user: userCreatingComment._id_user,
                name: userCreatingComment.name,
                last_name: userCreatingComment.last_name,
                is_followed: false,
            },
            Review: {
                _id_review: parentReview._id_review,
                content: parentReview.content,
                rating: parentReview.rating,
            },
        };

        return res.status(201).json({
            message: "Comment created successfully",
            comment: commentData,
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Update Comment
export const updateComment = async (req, res) => {
    const _id_comment = req.query._id_comment;
    const { content } = req.body;
    const _id_user = req.user._id_user;

    if (!content) {
        return res.status(400).json({ message: "Content is required" });
    }

    try {
        const commentToUpdate = await Comment.findOne({
            where: { _id_comment },
        });

        if (!commentToUpdate) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (commentToUpdate._id_user !== _id_user) {
            return res.status(403).json({
                message: "You do not have permission to edit this comment",
            });
        }

        commentToUpdate.content = content;
        await commentToUpdate.save();

        res.status(200).json({
            message: "Comment updated successfully",
            comment: commentToUpdate,
        });
    } catch (error) {
        console.error("Error updating comment:", error);
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors.map((err) => err.message),
            });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

// Deactivate Comment
export const deactivateComment = async (req, res) => {
    const _id_comment = req.query._id_comment;
    const _id_user = req.user._id_user;

    try {
        const commentToDeactivate = await Comment.findOne({
            where: { _id_comment },
        });

        if (!commentToDeactivate) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (commentToDeactivate._id_user !== _id_user) {
            return res.status(403).json({
                message:
                    "You do not have permission to deactivate this comment",
            });
        }

        commentToDeactivate.is_valid = false;
        await commentToDeactivate.save();

        return res.status(200).json({
            message: "Comment deactivated successfully",
            deactivated: true,
        });
    } catch (error) {
        console.error("Error deactivating comment:", error);
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors.map((err) => err.message),
            });
        } else {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
};

import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { CommentImages } from "../models/commentImages.js";
import { UserFollowers } from "../models/userFollowers.js";
import CommentDTO from "../models/dto/comment_dto.js";
import { commentMetaData } from "../middlewares/commentInteractions.js";
import { softDeleteCommentAndChildren } from "../middlewares/softDeleteComments.js";

//Get Comment Children
export const getCommentChildren = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    const _id_comment = req.query._id_comment;

    if (!_id_comment) {
        return res.status(400).json({ message: "Comment ID is required" });
    }

    try {
        const parentComment = await Comment.findByPk(_id_comment, {
            include: [
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "profile_picture_url",
                    ],
                    as: "User",
                },
                {
                    model: CommentImages,
                    attributes: ["image_url"],
                },
                // Include all levels of children comments using the "children" association
                {
                    model: Comment,
                    as: "children",
                    nested: true,
                    include: [
                        {
                            model: User,
                            attributes: [
                                "_id_user",
                                "name",
                                "last_name",
                                "profile_picture_url",
                            ],
                            as: "User",
                        },
                        {
                            model: CommentImages,
                            attributes: ["image_url"],
                        },
                        // Continue to include "children" association for all levels
                    ],
                },
            ],
        });

        console.log("\n -- COMMENT: ", parentComment.children);
        if (!parentComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const childComments = await Comment.findAll({
            where: { _id_parent: _id_comment },
            include: [
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "profile_picture_url",
                    ],
                    as: "User",
                },
                {
                    model: CommentImages,
                    attributes: ["image_url"],
                },
            ],
        });

        const allComments = [parentComment, ...childComments];
        const { likesMetaDataObject, repliesMetaDataObject } =
            await commentMetaData(allComments, _id_user_requesting);

        const userFollowingsSet = new Set(
            (
                await UserFollowers.findAll({
                    where: { _id_follower: _id_user_requesting },
                })
            ).map((following) => following._id_followed)
        );

        const parentCommentDTO = new CommentDTO(
            parentComment,
            _id_user_requesting
        );
        parentCommentDTO.setMetaData(
            likesMetaDataObject || {},
            repliesMetaDataObject || {},
            userFollowingsSet
        );
        parentCommentDTO.setImages(
            parentComment.CommentImages.map((image) => image.image_url)
        );

        const transformedChildrenDTOs = childComments.map((child) => {
            const childDTO = new CommentDTO(child, _id_user_requesting);
            childDTO.setMetaData(
                likesMetaDataObject || {},
                repliesMetaDataObject || {},
                userFollowingsSet
            );
            childDTO.setImages(
                child.CommentImages.map((image) => image.image_url)
            );
            return childDTO;
        });

        parentCommentDTO.setChildren(transformedChildrenDTOs);

        res.status(200).json({
            message: "Comments retrieved successfully",
            comment: parentCommentDTO.getCommentData(),
        });
    } catch (error) {
        console.error("Error finding comments:", error);
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
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

    console.log("User Model Associations:", Object.keys(Comment.associations));

    try {
        const commentToDeactivate = await Comment.findOne({
            where: { _id_comment },
            include: ["children"],
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

        // Soft delete the comment and its children
        await softDeleteCommentAndChildren(_id_comment);

        return res.status(200).json({
            message: "Comment and its children deactivated successfully",
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

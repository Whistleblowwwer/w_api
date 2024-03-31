import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { CommentImages } from "../models/commentImages.js";
import { UserFollowers } from "../models/userFollowers.js";
import CommentDTO from "../models/dto/comment_dto.js";
import NotificationDTO from "../models/dto/notification_dto.js";
import { commentMetaData } from "../utils/edges/commentInteractions.js";
import { Notification } from "../models/notifications.js";
import { softDeleteCommentAndChildren } from "../utils/softDeleteComments.js";

//Get Comment Children
export const getCommentChildren = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    const _id_comment = req.query._id_comment;

    if (!_id_comment) {
        return res.status(400).json({ message: "Comment ID is required" });
    }

    try {
        // Fetch paretn comment and first children
        const parentComment = await Comment.findByPk(_id_comment, {
            where: {
                is_valid: true,
            },
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
                    ],
                },
            ],
        });

        if (!parentComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Used for each children, to count replies using commentInteractions
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

        // Counts likes a replies of children.
        const { likesMetaDataObject, repliesMetaDataObject } =
            await commentMetaData(allComments, _id_user_requesting);

        // Fetch user followings
        const userFollowingsSet = new Set(
            (
                await UserFollowers.findAll({
                    where: { _id_follower: _id_user_requesting },
                })
            ).map((following) => following._id_followed)
        );

        // Initializes parent
        const parentCommentDTO = new CommentDTO(
            parentComment,
            _id_user_requesting
        );

        //
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

        const createdComment = await Comment.create({
            content,
            _id_review,
            _id_user,
            _id_parent: _id_parent || null,
        });

        if (_id_user !== parentReview._id_user) {
            const reviewCommentNotificationDTO = new NotificationDTO();
            await reviewCommentNotificationDTO.generateReviewCommentNotification(
                _id_user, // sender
                parentReview._id_user, // receiver
                createdComment._id_comment, // target
                content, // comment
                parentReview.content // review
            );
        }

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

        // Soft delete associated notifications
        await Notification.update(
            { is_valid: false },
            {
                where: { _id_target: _id_comment, type: "comment" },
            }
        );

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

// Get users who liked a comment
export const getCommentUserLikes = async (req, res) => {
    const commentId = req.params.commentId; // Get the comment id from request parameters

    try {
        // Find the comment by id
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(400).send({ message: "Comment not found" });
        }

        // Retrieve the users who liked the comment
        const likedUsers = await comment.getCommentLikers({
            attributes: {
                exclude: [
                    "password_token",
                    "email",
                    "fcm_token",
                    "createdAt",
                    "updatedAt",
                ],
            },
        });

        // Define an array to store modified user objects
        const modifiedLikedUsers = [];

        // Iterate over each liked user
        for (const user of likedUsers) {
            // Get the count of followings and followers for the user
            const followingsCount = await UserFollowers.count({
                where: { _id_follower: user._id_user },
            });

            const followersCount = await UserFollowers.count({
                where: { _id_followed: user._id_user },
            });

            // Check if the requesting user is following the user
            const isFollowed = await UserFollowers.findOne({
                where: {
                    _id_follower: req.user._id_user,
                    _id_followed: user._id_user,
                },
            });

            // Modify the user object to include additional fields
            const modifiedUser = {
                ...user.toJSON(),
                followings: followingsCount,
                followers: followersCount,
                is_followed: isFollowed ? true : false,
            };

            // Add the modified user object to the array
            modifiedLikedUsers.push(modifiedUser);
        }

        res.status(200).send({ users: modifiedLikedUsers });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get users who commented on a comment
export const getCommentUserComments = async (req, res) => {
    const commentId = req.params.commentId; // Get the comment id from request parameters

    try {
        // Find the comment by id
        const comment = await Comment.findByPk(commentId);

        if (!comment) {
            return res.status(400).send({ message: "Comment not found" });
        }

        // Retrieve the child comments of the comment
        const comments = await comment.getChildren({
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: {
                        exclude: [
                            "password_token",
                            "email",
                            "fcm_token",
                            "createdAt",
                            "updatedAt",
                        ],
                    },
                },
            ],
            attributes: {
                exclude: ["password_token", "email", "fcm_token", "updatedAt"],
            },
        });

        // Define an array to store modified comment objects
        const modifiedComments = [];

        // Iterate over each comment
        for (const childComment of comments) {
            // Get the count of followings and followers for the user who made the comment
            const followingsCount = await UserFollowers.count({
                where: { _id_follower: childComment.User._id_user },
            });

            const followersCount = await UserFollowers.count({
                where: { _id_followed: childComment.User._id_user },
            });

            // Check if the requesting user is following the user who made the comment
            const isFollowed = await UserFollowers.findOne({
                where: {
                    _id_follower: req.user._id_user,
                    _id_followed: childComment.User._id_user,
                },
            });

            // Construct the modified comment object with user data at the top level and comment data inside a Comment object
            const modifiedComment = {
                Comment: {
                    _id_comment: childComment._id_comment,
                    content: childComment.content,
                    is_valid: childComment.is_valid,
                    createdAt: childComment.createdAt,
                    _id_user: childComment._id_user,
                    _id_review: childComment._id_review,
                    _id_parent: childComment._id_parent,
                },
                _id_user: childComment.User._id_user,
                name: childComment.User.name,
                last_name: childComment.User.last_name,
                phone_number: childComment.User.phone_number,
                birth_date: childComment.User.birth_date,
                gender: childComment.User.gender,
                profile_picture_url: childComment.User.profile_picture_url,
                role: childComment.User.role,
                is_valid: childComment.User.is_valid,
                nick_name: childComment.User.nick_name,
                blockedBy: childComment.User.blockedBy,
                followings: followingsCount,
                followers: followersCount,
                is_followed: isFollowed ? true : false,
            };

            // Add the modified comment object to the array
            modifiedComments.push(modifiedComment);
        }

        res.status(200).send({ comments: modifiedComments });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

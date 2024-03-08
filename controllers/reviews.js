import { Sequelize, Op } from "sequelize";
import { User } from "../models/users.js";
import { Ad } from "../models/ads.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Business } from "../models/business.js";
import ReviewDTO from "../models/dto/review_dto.js";
import CommentDTO from "../models/dto/comment_dto.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { ReviewImages } from "../models/reviewImages.js";
import { CommentLikes } from "../models/commentLikes.js";
import { CommentImages } from "../models/commentImages.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import {
    commentsMetaData,
    likesMetaData,
} from "../utils/edges/reviewInteractions.js";
import { commentMetaData } from "../utils/edges/commentInteractions.js";

//Create Review
export const createReview = async (req, res) => {
    try {
        const { _id_business, content, rating } = req.body;
        const _id_user = req.user._id_user;

        const missingFields = ["_id_business", "content", "rating"].filter(
            (field) => !req.body[field]
        );
        if (missingFields.length > 0) {
            return res
                .status(400)
                .send({ message: `Missing ${missingFields.join(", ")}` });
        }

        const [businessReviewed, userCreatingReview] = await Promise.all([
            Business.findByPk(_id_business),
            User.findByPk(_id_user),
        ]);

        if (!businessReviewed) {
            return res.status(404).send({ message: "Business not found" });
        }

        if (!userCreatingReview) {
            return res.status(404).send({ message: "User not found" });
        }

        if (!userCreatingReview.is_valid) {
            return res.status(400).send({ message: "User is not valid" });
        }

        if (!businessReviewed.is_valid) {
            return res.status(400).send({ message: "Business is not valid" });
        }

        // const containsBadWord = await filterBadWords(content);
        // if (containsBadWord) {
        //     return res
        //         .status(400)
        //         .send({ message: "Contenido contiene palabras prohibidas" });
        // }

        const createdReview = await Review.create({
            content,
            _id_business,
            _id_user,
            rating,
        });

        // Fetch the newly created review with associated User
        const reviewWithUser = await Review.findByPk(createdReview._id_review, {
            include: [
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name", "nick_name"],
                },
                {
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
            ],
        });

        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user },
        });

        const reviewDTO = new ReviewDTO(reviewWithUser.dataValues, _id_user);
        reviewDTO.setBusiness(businessFollowings);

        return res.status(201).send({
            message: "Review created successfully",
            review: reviewDTO.getReviewData(),
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            console.error("Error creating review:", error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }
};

//Get Review by id only with parent comments
export const getReviewParent = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    const _id_review = req.query._id_review;

    try {
        const review = await Review.findByPk(_id_review, {
            include: [
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "nick_name",
                        "profile_picture_url",
                    ],
                    as: "User",
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: Business,
                    attributes: [
                        "_id_business",
                        "name",
                        "entity",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: ReviewImages,
                    attributes: ["image_url"],
                },
            ],
        });

        if (!review) {
            return res.status(404).send({ message: "Review not found" });
        }

        const likesForReview = await likesMetaData(
            [review],
            _id_user_requesting
        );
        const likeDataForReview = likesForReview.find(
            (like) => like._id_review === review._id_review
        );

        const commentsData = await commentsMetaData([review]);
        const commentsForReview = commentsData.find(
            (c) => c._id_review === review._id_review
        );

        const parentComments = await Comment.findAll({
            where: {
                _id_review: review._id_review,
                _id_parent: null,
                is_valid: true,
            },
            include: [
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "nick_name",
                        "profile_picture_url",
                    ],
                    as: "User",
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: CommentImages,
                    attributes: ["image_url"],
                },
            ],
        });

        const { likesMetaDataObject, repliesMetaDataObject } =
            await commentMetaData(parentComments, _id_user_requesting);

        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });
        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        });

        const transformedComments = parentComments.map((comment) => {
            const commentDTO = new CommentDTO(comment, _id_user_requesting);
            commentDTO.setMetaData(
                likesMetaDataObject,
                repliesMetaDataObject,
                new Set(
                    userFollowings.map((following) => following._id_followed)
                )
            );
            const imageUrls = comment.CommentImages.map(
                (image) => image.image_url
            );
            commentDTO.setImages(imageUrls);
            return commentDTO.getCommentData();
        });

        const reviewDTO = new ReviewDTO(review, _id_user_requesting);
        reviewDTO.setMetaData(
            commentsForReview || {},
            likeDataForReview || {},
            userFollowings,
            businessFollowings
        );

        const imageUrls = review.ReviewImages.map((image) => image.image_url);
        reviewDTO.setImages(imageUrls);

        const reviewWithParentComments = {
            ...reviewDTO.getReviewData(),
            Comments: transformedComments,
        };

        return res.status(200).send(reviewWithParentComments);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Internal server error", error: error.message });
    }
};

//Get Review by Id (with comments and children)
export const getReviewChildren = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    const _id_review = req.query._id_review;

    try {
        const review = await Review.findByPk(_id_review, {
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "reviewLikes" AS reviewLikes
                            WHERE
                            reviewLikes."_id_review" = "Review"."_id_review" AND is_valid = true
                        )`),
                        "likes",
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "comments" as Comments
                            WHERE
                            Comments._id_review = "Review"."_id_review" AND is_valid = true
                        )`),
                        "comments",
                    ],
                ],
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
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: Business,
                    attributes: [
                        "_id_business",
                        "name",
                        "entity",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: Comment,
                    as: "Comments",
                    where: { _id_parent: null, is_valid: true },
                    required: false,
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
                            where: {
                                is_valid: true,
                            },
                        },
                        {
                            model: Comment,
                            as: "Children",
                            required: false,
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
                                    where: {
                                        is_valid: true,
                                    },
                                },
                            ],
                        },
                    ],
                    attributes: {
                        include: [
                            [
                                Sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM "commentLikes" AS commentLikes
                                    WHERE
                                    commentLikes."_id_comment" = "Comments"."_id_comment" AND is_valid = true
                                )`),
                                "likes",
                            ],
                        ],
                    },
                },
            ],
        });

        if (!review) {
            return res.status(404).send({ message: "Review not found" });
        }

        const userLikedReviews = await ReviewLikes.findOne({
            where: {
                _id_review: _id_review,
                _id_user: _id_user_requesting,
            },
        });

        const userLikedComments = await CommentLikes.findAll({
            where: {
                _id_comment: {
                    [Sequelize.Op.in]: review.Comments.map(
                        (comment) => comment._id_comment
                    ),
                },
                _id_user: _id_user_requesting,
            },
        });

        const likedCommentsSet = new Set(
            userLikedComments.map((like) => like._id_comment)
        );

        const childCommentsIds = review.Comments.flatMap((parentComment) =>
            parentComment.Children.map(
                (childComment) => childComment._id_comment
            )
        );

        const childCommentLikesCounts = await CommentLikes.findAll({
            attributes: [
                "_id_comment",
                [
                    Sequelize.fn("COUNT", Sequelize.col("_id_comment")),
                    "totalLikes",
                ],
            ],
            where: {
                _id_comment: {
                    [Sequelize.Op.in]: childCommentsIds,
                },
            },
            group: ["_id_comment"],
        });

        const likesCountByChildCommentId = new Map(
            childCommentLikesCounts.map((commentLike) => [
                commentLike._id_comment,
                commentLike.getDataValue("totalLikes"),
            ])
        );

        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        }).then(
            (followings) =>
                new Set(followings.map((following) => following._id_followed))
        );

        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        }).then(
            (followings) =>
                new Set(followings.map((following) => following._id_business))
        );

        const transformedComments = review.Comments.map((parentComment) => {
            const children = parentComment.Children.map((childComment) => {
                const childCommentLikesCount =
                    likesCountByChildCommentId.get(childComment._id_comment) ||
                    0;

                return {
                    _id_comment: childComment._id_comment,
                    content: childComment.content,
                    is_valid: childComment.is_valid,
                    createdAt: childComment.createdAt,
                    updatedAt: childComment.updatedAt,
                    _id_user: childComment._id_user,
                    _id_review: childComment._id_review,
                    is_liked: likedCommentsSet.has(childComment._id_comment),
                    likes: childCommentLikesCount.toString(),
                    comments: childComment.Children
                        ? childComment.Children.length.toString()
                        : "0",
                    User: {
                        ...childComment.User.get({ plain: true }),
                        is_followed: userFollowings.has(
                            childComment.User._id_user
                        ),
                    },
                };
            });

            return {
                _id_comment: parentComment._id_comment,
                content: parentComment.content,
                is_valid: parentComment.is_valid,
                createdAt: parentComment.createdAt,
                updatedAt: parentComment.updatedAt,
                _id_user: parentComment._id_user,
                _id_review: parentComment._id_review,
                is_liked: likedCommentsSet.has(parentComment._id_comment),
                likes: parentComment.getDataValue("likes"),
                comments: children.length.toString(),
                User: {
                    ...parentComment.User.get({ plain: true }),
                    is_followed: userFollowings.has(
                        parentComment.User._id_user
                    ),
                },
                Children: children,
            };
        });

        const reviewData = {
            _id_review: review._id_review,
            content: review.content,
            rating: review.rating,
            is_valid: review.is_valid,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            _id_business: review._id_business,
            _id_user: review._id_user,
            is_liked: !!userLikedReviews,
            likes: review.getDataValue("likes"),
            comments: review.getDataValue("comments"),
            User: {
                ...review.User.get({ plain: true }),
                is_followed: userFollowings.has(review.User._id_user),
            },
            Business: {
                ...review.Business.get({ plain: true }),
                is_followed: businessFollowings.has(
                    review.Business._id_business
                ),
            },
            Comments: transformedComments,
        };

        return res.status(200).send(reviewData);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Internal server error", error: error.message });
    }
};

//Get Reviews of a Business
export const getReviewsForBusiness = async (req, res) => {
    const _id_business = req.query._id_business;
    const _id_user_requesting = req.user._id_user;

    try {
        const businessReviews = await Review.findAll({
            where: { _id_business: _id_business, is_valid: true },
            limit: 20,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Business,
                    attributes: [
                        "_id_business",
                        "name",
                        "entity",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "nick_name",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: ReviewImages,
                    attributes: ["image_url"],
                },
            ],
        });

        const commentsDTO = await commentsMetaData(businessReviews);
        const likesDTO = await likesMetaData(
            businessReviews,
            _id_user_requesting
        );
        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });
        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        });

        const likesMap = new Map(
            likesDTO.map((like) => [like.dataValues._id_review, like])
        );

        const reviewsWithLikesAndFollowInfo = await Promise.all(
            businessReviews.map(async (review, index) => {
                const reviewLike = likesMap.get(review._id_review);

                const reviewDTO = new ReviewDTO(
                    review.dataValues,
                    reviewLike?.dataValues?.userLiked === "1",
                    userFollowings,
                    businessFollowings,
                    _id_user_requesting
                );

                reviewDTO.setMetaData(
                    commentsDTO[index],
                    reviewLike,
                    userFollowings,
                    businessFollowings
                );

                const imageUrls = review.ReviewImages.map(
                    (image) => image.image_url
                );
                reviewDTO.setImages(imageUrls);

                return reviewDTO.getReviewData();
            })
        );

        res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
        });
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

//Get Liked Reviews by a User
export const getUserLikedReviews = async (req, res) => {
    let _id_user = req.query._id_user;

    if (!_id_user) {
        _id_user = req.user._id_user;
    }

    const _id_user_requesting = req.user._id_user;

    try {
        const likedReviewIds = await ReviewLikes.findAll({
            where: { _id_user: _id_user_requesting },
            attributes: ["_id_review"],
        });

        const reviewIds = likedReviewIds.map((like) => like._id_review);

        const likedReviews = await Review.findAll({
            where: {
                _id_review: { [Sequelize.Op.in]: reviewIds },
                is_valid: true,
            },
            limit: 20,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Business,
                    attributes: [
                        "_id_business",
                        "name",
                        "entity",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "nick_name",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: ReviewImages,
                    attributes: ["image_url"],
                },
            ],
        });

        const commentsDTO = await commentsMetaData(likedReviews);
        const likesDTO = await likesMetaData(likedReviews, _id_user_requesting);
        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });
        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        });

        const likesMap = new Map(
            likesDTO.map((like) => [like.dataValues._id_review, like])
        );

        const reviewsWithLikesAndFollowInfo = likedReviews.map(
            (review, index) => {
                const reviewLike = likesMap.get(review._id_review);

                const reviewDTO = new ReviewDTO(
                    review.dataValues,
                    reviewLike?.dataValues?.userLiked === "1",
                    userFollowings,
                    businessFollowings,
                    _id_user_requesting
                );

                reviewDTO.setMetaData(
                    commentsDTO[index],
                    reviewLike,
                    userFollowings,
                    businessFollowings
                );

                const imageUrls = review.ReviewImages.map(
                    (image) => image.image_url
                );
                reviewDTO.setImages(imageUrls);

                return reviewDTO.getReviewData();
            }
        );

        res.status(200).send({
            message: "Liked reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
        });
    } catch (error) {
        console.error("Error retrieving liked reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Get All Reviews
export const getAllReviews = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    try {
        const blockedUsers = await User.findAll({
            where: {
                blockedBy: {
                    [Op.contains]: [_id_user_requesting],
                },
            },
        });

        const blockedUserIds = blockedUsers.map((user) => user._id_user).flat();

        const allReviews = await Review.findAll({
            where: {
                is_valid: true,
                _id_user: {
                    [Op.notIn]: blockedUserIds, // Exclude reviews made by blocked users
                },
            },
            limit: 30,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Business,
                    attributes: [
                        "_id_business",
                        "name",
                        "entity",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: User,
                    attributes: [
                        "_id_user",
                        "name",
                        "last_name",
                        "nick_name",
                        "profile_picture_url",
                    ],
                    where: {
                        is_valid: true,
                    },
                },
                {
                    model: ReviewImages,
                    attributes: ["image_url"],
                },
            ],
        });

        const commentsDTO = await commentsMetaData(allReviews);
        const likesDTO = await likesMetaData(allReviews, _id_user_requesting);
        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });
        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        });

        const likesMap = new Map(
            likesDTO.map((like) => [like.dataValues._id_review, like])
        );

        const reviewsWithLikesAndFollowInfo = allReviews.map(
            (review, index) => {
                const reviewLike = likesMap.get(review._id_review);

                const reviewDTO = new ReviewDTO(
                    review.dataValues,
                    reviewLike?.dataValues?.userLiked === "1",
                    userFollowings,
                    businessFollowings,
                    _id_user_requesting
                );

                reviewDTO.setMetaData(
                    commentsDTO[index],
                    reviewLike,
                    userFollowings,
                    businessFollowings
                );

                const imageUrls = review.ReviewImages.map(
                    (image) => image.image_url
                );
                reviewDTO.setImages(imageUrls);

                return reviewDTO.getReviewData();
            }
        );

        res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
        });
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Update Review
export const updateReview = async (req, res) => {
    const { content, rating } = req.body;

    const _id_review = req.query._id_review;
    const _id_user = req.user._id_user;

    try {
        const reviewToUpdate = await Review.findOne({
            where: { _id_review },
        });

        if (!reviewToUpdate) {
            return res.status(404).send({ message: "Review not found" });
        }

        if (reviewToUpdate._id_user !== _id_user) {
            return res.status(403).send({
                message: "You are not authorized to update this review",
            });
        }

        reviewToUpdate.content = content;
        reviewToUpdate.rating = rating;
        await reviewToUpdate.save();

        return res.status(200).send({
            message: "Review updated successfully",
            review: reviewToUpdate,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }
};

// Delete Review
export const deleteReview = async (req, res) => {
    const _id_review = req.query._id_review;
    const _id_user = req.user._id_user;

    try {
        // Find the review to delete
        const deletedReview = await Review.findOne({
            where: { _id_review, _id_user, is_valid: true },
        });

        if (!deletedReview) {
            return res
                .status(404)
                .send({ message: "You cannot delete other user's reviews" });
        }

        // Mark the review as invalid (soft delete)
        await deletedReview.update({ is_valid: false });

        // Soft delete related entities (comments, likes, images, etc.)
        await Promise.all([
            Comment.update({ is_valid: false }, { where: { _id_review } }),
            CommentLikes.update({ is_valid: false }, { where: { _id_review } }),
            CommentImages.update(
                { is_valid: false },
                { where: { _id_review } }
            ),
            ReviewLikes.update({ is_valid: false }, { where: { _id_review } }),
            ReviewImages.update({ is_valid: false }, { where: { _id_review } }),
        ]);

        return res.status(200).send({ message: "Review deleted successfully" });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            console.error("Error deleting review:", error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }
};

// Get users who liked a review
export const getReviewUserLikes = async (req, res) => {
    const reviewId = req.params.reviewId; // Get the review id from request parameters

    try {
        // Find the review by id
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(400).send({ message: "Review not found" });
        }

        // Retrieve the users who liked the review
        const likedUsers = await review.getUserLikes({
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

// Get users who commented on a review
export const getReviewUserComments = async (req, res) => {
    const reviewId = req.params.reviewId; // Get the review id from request parameters

    try {
        // Find the review by id
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(400).send({ message: "Review not found" });
        }

        // Retrieve the comments on the review
        const comments = await review.getComments({
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
        for (const comment of comments) {
            // Get the count of followings and followers for the user who made the comment
            const followingsCount = await UserFollowers.count({
                where: { _id_follower: comment.User._id_user },
            });

            const followersCount = await UserFollowers.count({
                where: { _id_followed: comment.User._id_user },
            });

            // Check if the requesting user is following the user who made the comment
            const isFollowed = await UserFollowers.findOne({
                where: {
                    _id_follower: req.user._id_user,
                    _id_followed: comment.User._id_user,
                },
            });

            // Construct the modified comment object with user data at the top level and comment data inside a Comment object
            const modifiedComment = {
                Comment: {
                    _id_comment: comment._id_comment,
                    content: comment.content,
                    is_valid: comment.is_valid,
                    createdAt: comment.createdAt,
                    _id_user: comment._id_user,
                    _id_review: comment._id_review,
                    _id_parent: comment._id_parent,
                },
                _id_user: comment.User._id_user,
                name: comment.User.name,
                last_name: comment.User.last_name,
                phone_number: comment.User.phone_number,
                birth_date: comment.User.birth_date,
                gender: comment.User.gender,
                profile_picture_url: comment.User.profile_picture_url,
                role: comment.User.role,
                is_valid: comment.User.is_valid,
                nick_name: comment.User.nick_name,
                blockedBy: comment.User.blockedBy,
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

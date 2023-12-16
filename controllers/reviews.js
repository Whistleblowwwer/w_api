import { Sequelize } from "sequelize";
import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Business } from "../models/business.js";
import ReviewDTO from "../models/dto/review_dto.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { CommentLikes } from "../models/commentLikes.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import { ReviewImages } from "../models/reviewImages.js";
import {
    commentsMetaData,
    likesMetaData,
} from "../middlewares/reviewInteractions.js";

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
            ],
        });

        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user },
        });

        console.log("\n -- REVIEW & USER: ", reviewWithUser);
        // Now you can use reviewWithUser in your DTO
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
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "reviewLikes" AS reviewLikes
                            WHERE
                            reviewLikes."_id_review" = "Review"."_id_review"
                        )`),
                        "likes",
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "comments" as Comments
                            WHERE
                            Comments._id_review = "Review"."_id_review"
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
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: Comment,
                    as: "Comments",
                    where: { _id_parent: null },
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
                                    commentLikes."_id_comment" = "Comments"."_id_comment"
                                )`),
                                "likes",
                            ],
                            [
                                Sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM Comments as "children"
                                    WHERE
                                    "children"."_id_parent" = "Comments"."_id_comment"
                                )`),
                                "childrenCommentCount",
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

        // Retrieve liked comments for the user
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

        // Create a set of liked comment IDs
        const likedCommentsSet = new Set(
            userLikedComments.map((like) => like._id_comment)
        );

        const transformedComments = review.Comments.map((comment) => ({
            _id_comment: comment._id_comment,
            content: comment.content,
            is_valid: comment.is_valid,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            _id_business: comment._id_business,
            _id_user: comment._id_user,
            _id_review: comment._id_review,
            _id_parent: comment._id_parent,
            is_liked: likedCommentsSet.has(comment._id_comment),
            likes: comment.getDataValue("likes"),
            comments: comment.getDataValue("childrenCommentCount"),
            User: {
                ...comment.User.get({ plain: true }),
                is_followed: userFollowings.has(comment.User._id_user),
            },
        }));

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
                            reviewLikes."_id_review" = "Review"."_id_review"
                        )`),
                        "likes",
                    ],
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "comments" as Comments
                            WHERE
                            Comments._id_review = "Review"."_id_review"
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
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: Comment,
                    as: "Comments",
                    where: { _id_parent: null },
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ["_id_user", "name", "last_name"],
                            as: "User",
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
                                    ],
                                    as: "User",
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
                                    commentLikes."_id_comment" = "Comments"."_id_comment"
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
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name", "nick_name"],
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

        const reviewsWithLikesAndFollowInfo = businessReviews.map(
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
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name", "nick_name"],
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
        const allReviews = await Review.findAll({
            where: { is_valid: true },
            limit: 20,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name", "nick_name"],
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

                const Images = ReviewImages.getAll({
                    where: {_id_review: reviewDTO._id_review},
                    attributes: ['image_url']
                })
                console.log(Images)
                reviewDTO.setImages();

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

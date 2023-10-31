import { User } from "../models/users.js";
import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Sequelize } from "sequelize";
// import { CommentLikes } from "../models/commentLikes.js";
// import { ReviewLikes } from "../models/reviewLikes.js";

// Create Review
export const createReview = async (req, res) => {
    const { content, _id_business } = req.body;
    const _id_user = req.user._id_user;

    if (!_id_business) {
        return res.status(400).send({ message: "Missing business ID" });
    }
    if (!_id_user) {
        return res.status(400).send({ message: "Missing user ID" });
    }
    if (!content) {
        return res
            .status(400)
            .send({ message: "Missing content for the review" });
    }

    try {
        const businessReviewed = await Business.findByPk(_id_business);
        if (!businessReviewed) {
            return res.status(404).send({ message: "Business not found" });
        }

        const userCreatingReview = await User.findByPk(_id_user);
        if (!userCreatingReview) {
            return res.status(404).send({ message: "User not found" });
        }

        const createdReview = await Review.create({
            content,
            _id_business,
            _id_user,
        });

        return res.status(201).send({
            message: "Review created successfully",
            review: createdReview,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            return res.status(500).send({ message: "Internal server error" });
        }
    }
};

//Get Review by Id (with comments)
export const getReview = async (req, res) => {
    const _id_review = req.params._id_review;

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
                    as: "Comments",
                    where: { _id_parent: null },
                    required: false,
                    include: [
                        {
                            model: User,
                            attributes: ["name"],
                            as: "User",
                        },
                        {
                            model: Comment,
                            as: "Children",
                            required: false,
                            include: [
                                {
                                    model: User,
                                    attributes: ["name"],
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
                {
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
            ],
        });

        if (!review) {
            return res.status(404).send({ message: "Review not found" });
        }

        const transformedComments = review.Comments.map((comment) => ({
            ...comment.dataValues,
            likes: comment.getDataValue("likes"),
            Children: comment.Children.map((child) => ({
                ...child.dataValues,
                likes: child.getDataValue("likes"),
            })),
        }));

        return res.status(200).send({
            ...review.dataValues,
            likes: review.getDataValue("likes"),
            comments: transformedComments,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .send({ message: "Internal server error", error: error.message });
    }
};

// Get Reviews For Business
export const getReviewsForBusiness = async (req, res) => {
    const _id_business = req.params._id_business;

    try {
        const reviewsOfBusiness = await Review.findAll({
            where: { _id_business },
            limit: 20,
            order: [["createdAt", "DESC"]],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "reviewLikes" as reviewLikes
                            WHERE
                            reviewLikes._id_review = "Review"."_id_review"
                        )`),
                        "likes",
                    ],
                ],
            },
            include: [
                {
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                },
            ],
        });

        if (reviewsOfBusiness.length === 0) {
            return res
                .status(404)
                .send({ message: "No reviews found for this business" });
        }

        const reviewsWithBusinessInfo = reviewsOfBusiness.map((review) => ({
            _id_review: review._id_review,
            content: review.content,
            is_valid: review.is_valid,
            created_at: review.createdAt,
            likes: review.getDataValue("likes"),
            business: {
                _id_business: review.Business._id_business,
                name: review.Business.name,
                entity: review.Business.entity,
            },
            user: {
                _id_user: review.User._id_user,
                name: review.User.name,
                last_name: review.User.last_name,
            },
        }));

        return res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithBusinessInfo,
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Internal server error", error: error.message });
    }
};

// Get All Reviews
export const getAllReviews = async (req, res) => {
    try {
        const allReviews = await Review.findAll({
            limit: 20,
            order: [["createdAt", "DESC"]],
            attributes: {
                include: [
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM "reviewLikes"
                            WHERE
                            "reviewLikes"."_id_review" = "Review"."_id_review"
                        )`),
                        "likes",
                    ],
                ],
            },
            include: [
                {
                    model: Business,
                    attributes: ["_id_business", "name", "entity"],
                },
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                },
            ],
        });

        if (!allReviews || allReviews.length === 0) {
            return res.status(404).send({ message: "No reviews found" });
        }

        const reviewsWithLikes = allReviews.map((review) => ({
            ...review.get({ plain: true }),
            likes: parseInt(review.getDataValue("likes"), 10),
        }));

        res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikes,
        });
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Update Review
export const updateReview = async (req, res) => {
    const { content } = req.body;

    const _id_review = req.params._id_review;
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
    const _id_review = req.params._id_review;
    const _id_user = req.user._id_user;

    try {
        const deletedReview = await Review.findOne({ where: { _id_review } });
        if (!deletedReview) {
            return res.status(404).send({ message: "Review not found" });
        }

        if (deletedReview._id_user !== _id_user) {
            return res.status(403).send({
                message: "You are not authorized to delete this review",
            });
        }

        deletedReview.is_valid = false;
        await deletedReview.save();

        return res.status(200).send({ message: "Review deleted successfully" });
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

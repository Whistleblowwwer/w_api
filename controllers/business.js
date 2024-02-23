import { Op } from "sequelize";
import Sequelize from "sequelize";
import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Business } from "../models/business.js";
import { Category } from "../models/categories.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { filterBadWords } from "../utils/text/badWordsFilter.js";
import { BusinessFollowers } from "../models/businessFollowers.js";

// Create Business
export const createBusiness = async (req, res) => {
    try {
        // Destructure fields from the request body
        const {
            name,
            entity,
            country,
            iso2_country_code,
            address,
            state,
            iso2_state_code,
            city,
            category,
        } = req.body;
        const _id_user = req.user._id_user;

        // Check for missing fields
        const requiredFields = [
            "name",
            "entity",
            "country",
            "iso2_country_code",
            "address",
            "state",
            "iso2_state_code",
            "city",
            "category",
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res
                    .status(400)
                    .send({ message: `Missing ${field} field` });
            }
        }

        // Check for profanity in relevant fields
        const containsBadWord = await filterBadWords(
            `${name} ${entity} ${address} ${state} ${city} ${category}`
        );
        if (containsBadWord) {
            return res
                .status(400)
                .send({ message: "Contenido contiene palabras prohibidas" });
        }

        // Check if a business with the same name already exists
        const existingBusiness = await Business.findOne({
            where: {
                name: {
                    [Sequelize.Op.iLike]: name, // Case-insensitive search
                },
            },
        });

        if (existingBusiness) {
            return res.status(400).send({
                message: "A business with the same name already exists",
            });
        }

        // Check if category exists or has a good similarity rate
        let categoryInstance;
        if (category) {
            const existingCategory = await Category.findOne({
                where: {
                    name: {
                        [Sequelize.Op.iLike]: category, // Case-insensitive search
                    },
                },
            });

            if (existingCategory) {
                categoryInstance = existingCategory;
            } else {
                // Create a new category if not found
                const createdCategory = await Category.create({
                    name: category,
                });
                categoryInstance = createdCategory;
            }
        }

        // Create business with category and additional fields
        const createdBusiness = await Business.create({
            name,
            address,
            state,
            city,
            country,
            iso2_country_code,
            iso2_state_code,
            entity,
            _id_user: _id_user,
            _id_category: categoryInstance
                ? categoryInstance._id_category
                : null,
        });

        return res.status(201).send({
            message: "Business created successfully",
            business: createdBusiness,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            return res
                .status(500)
                .send({ message: "Internal Server Error", error });
        }
    }
};

//Get Business Feed
export const getBusinessFeed = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        const followedBusinesses = await BusinessFollowers.findAll({
            where: { _id_user },
            attributes: ["_id_user"],
        });

        const followedBusinessesSet = new Set(
            followedBusinesses.map(
                (followedBusiness) => followedBusiness._id_user
            )
        );

        const businesses = await Business.findAll({
            include: [
                {
                    model: Review,
                    include: [
                        {
                            model: User,
                            attributes: ["name", "last_name"],
                        },
                    ],
                },
            ],
        });

        const feedData = await Promise.all(
            businesses.map(async (business) => {
                const averageRating =
                    business.Reviews.reduce(
                        (acc, review) => acc + review.rating,
                        0
                    ) / business.Reviews.length;

                let mostLikedReview = null;
                let maxLikes = -1;
                for (let review of business.Reviews) {
                    const likesCount = await ReviewLikes.count({
                        where: { _id_review: review._id_review },
                    });
                    if (likesCount > maxLikes) {
                        maxLikes = likesCount;
                        mostLikedReview = {
                            ...review.dataValues,
                            likes: likesCount,
                            User: {
                                name: review.User.name,
                                last_name: review.User.last_name,
                            },
                        };
                    }
                }

                const businessFollowStatus = followedBusinessesSet.has(
                    business._id_business
                );

                return {
                    Business: {
                        name: business.name,
                        is_followed: businessFollowStatus,
                        average_rating: averageRating,
                    },
                    Review: mostLikedReview,
                };
            })
        );

        res.status(200).json({ feed: feedData });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Generate Followed Business Feed
export const getFollowedBusinessFeed = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        const followedBusinesses = await BusinessFollowers.findAll({
            where: { _id_user },
            attributes: ["_id_business"],
        });

        const followedBusinessesIds = followedBusinesses.map(
            (business) => business._id_business
        );

        const businesses = await Business.findAll({
            where: {
                _id_business: followedBusinessesIds,
            },
            include: [
                {
                    model: Review,
                    include: [
                        {
                            model: User,
                            attributes: ["name", "last_name"],
                        },
                    ],
                },
            ],
        });

        const feedData = await Promise.all(
            businesses.map(async (business) => {
                const averageRating =
                    business.Reviews.reduce(
                        (acc, review) => acc + review.rating,
                        0
                    ) / business.Reviews.length;

                let reviewsWithMetrics = await Promise.all(
                    business.Reviews.map(async (review) => {
                        const likesCount = await ReviewLikes.count({
                            where: { _id_review: review._id_review },
                        });
                        const commentsCount = await Comment.count({
                            where: { _id_review: review._id_review },
                        });

                        return {
                            ...review.dataValues,
                            likes: likesCount,
                            comments: commentsCount,
                        };
                    })
                );

                reviewsWithMetrics.sort(
                    (a, b) => b.likes - a.likes || b.comments - a.comments
                );

                const mostRelevantReview = reviewsWithMetrics[0] || {};

                return {
                    Business: {
                        name: business.name,
                        is_followed: true,
                        average_rating: averageRating,
                    },
                    Review: mostRelevantReview,
                };
            })
        );

        feedData.sort(
            (a, b) =>
                b.Review.likes - a.Review.likes ||
                b.Review.comments - a.Review.comments
        );

        res.status(200).json({ feed: feedData });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Get Non Followed Business Feed
export const getNonFollowedBusinessFeed = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        const followedBusinesses = await BusinessFollowers.findAll({
            where: { _id_user },
            attributes: ["_id_business"],
        });

        const followedBusinessesIds = followedBusinesses.map(
            (business) => business._id_business
        );

        const nonFollowedBusinesses = await Business.findAll({
            where: {
                _id_business: { [Op.notIn]: followedBusinessesIds },
            },
            include: [
                {
                    model: Review,
                    include: [
                        {
                            model: User,
                            attributes: ["name", "last_name"],
                        },
                    ],
                },
            ],
        });

        const feedData = await Promise.all(
            nonFollowedBusinesses.map(async (business) => {
                const averageRating =
                    business.Reviews.reduce(
                        (acc, review) => acc + review.rating,
                        0
                    ) / business.Reviews.length;

                let reviewsWithMetrics = await Promise.all(
                    business.Reviews.map(async (review) => {
                        const likesCount = await ReviewLikes.count({
                            where: { _id_review: review._id_review },
                        });
                        const commentsCount = await Comment.count({
                            where: { _id_review: review._id_review },
                        });

                        return {
                            ...review.dataValues,
                            likes: likesCount,
                            comments: commentsCount,
                        };
                    })
                );

                reviewsWithMetrics.sort(
                    (a, b) => b.likes - a.likes || b.comments - a.comments
                );

                const mostRelevantReview = reviewsWithMetrics[0] || {};

                return {
                    Business: {
                        name: business.name,
                        is_followed: false,
                        average_rating: averageRating,
                    },
                    Review: mostRelevantReview,
                };
            })
        );

        feedData.sort(
            (a, b) =>
                b.Review.likes - a.Review.likes ||
                b.Review.comments - a.Review.comments
        );

        res.status(200).json({ feed: feedData });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Get Business Details
export const getBusinessDetails = async (req, res) => {
    const { _id_business } = req.query;
    const _id_user = req.user._id_user;

    try {
        const business = await Business.findByPk(_id_business);

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        const reviews = await Review.findAll({
            where: { _id_business: _id_business, is_valid: true },
            attributes: ["rating"],
        });

        const reviewsCount = reviews.length;

        const averageRating =
            reviewsCount > 0
                ? reviews.reduce((acc, review) => acc + review.rating, 0) /
                  reviewsCount
                : 0;

        const followers = await BusinessFollowers.findAll({
            where: { _id_business: _id_business },
        });
        const followerCount = followers.length;

        const businessFollowStatus = followers.some(
            (follower) => follower._id_user === _id_user
        );

        const businessCreator = await User.findByPk(business._id_user, {
            attributes: ["_id_user", "name", "last_name"],
        });

        const businessCategory = await Category.findByPk(
            business._id_category,
            {
                attributes: ["_id_category", "name"],
            }
        );

        const {
            _id_user: _,
            _id_category: __,
            ...restBusinessDetails
        } = business.get({ plain: true });

        const businessDetails = {
            ...restBusinessDetails,
            average_rating: averageRating,
            reviewsCount,
            followers: followerCount,
            is_followed: businessFollowStatus,
            User: businessCreator ? businessCreator.get({ plain: true }) : null,
            Category: businessCategory
                ? businessCategory.get({ plain: true })
                : null,
        };

        return res.status(200).send({
            message: "Business retrieved successfully",
            business: businessDetails,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get Business List 
export const listAllBusinesses = async (req, res) => {
    try {
        const businesses = await Business.findAll({
            order: [
                [
                    Sequelize.literal(
                        '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."_id_business" = "Business"."_id_business" AND "reviews"."is_valid" = true)'
                    ),
                    "DESC"
                ]
            ],
            attributes: [
                "_id_business",
                "name",
                "entity",
                "address",
                "state",
                "city",
                "profile_picture_url",
                "country",
                "iso2_country_code",
                "iso2_state_code",
                [
                    Sequelize.literal(
                        '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."_id_business" = "Business"."_id_business" AND "reviews"."is_valid" = true)'
                    ),
                    "reviewsCount",
                ],
                "is_valid",
                "createdAt",
                "updatedAt",
            ],
            include: [
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                },
                {
                    model: Category,
                    attributes: ["_id_category", "name"],
                },
                {
                    model: Review,
                    attributes: ["rating"],
                    where: { is_valid: true },
                    required: false,
                },
            ],
        });

        if (businesses.length === 0) {
            return res.status(404).send({ message: "No businesses found" });
        }

        // Extract relevant details and compute additional information
        const formattedBusinesses = await Promise.all(
            businesses.map(async (business) => {
                const {
                    _id_user: _,
                    _id_category: __,
                    reviewsCount,
                    Reviews, // Access the Reviews directly
                    ...restBusinessDetails
                } = business.get({ plain: true });

                // Fetch the count of followers for each business
                const followersCount = await BusinessFollowers.count({
                    where: { _id_business: business._id_business },
                });

                // Assuming reviewsCount is the count of valid reviews
                const averageRating =
                    reviewsCount > 0
                        ? Reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                          ) / reviewsCount
                        : 0;

                // Add the computed values to the business details
                return {
                    ...restBusinessDetails,
                    average_rating: averageRating,
                    reviewsCount,
                    followers: followersCount,
                    User: business.User
                        ? business.User.get({ plain: true })
                        : null,
                    Category: business.Category
                        ? business.Category.get({ plain: true })
                        : null,
                };
            })
        );

        return res.status(200).send({
            message: "Businesses found successfully",
            businesses: formattedBusinesses,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Get Businesses created by a User
export const getMyBusinesses = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        const businesses = await Business.findAll({
            where: { _id_user },
            order: [["createdAt", "DESC"]],
        });

        if (businesses.length === 0) {
            return res.status(404).send({ message: "No businesses found" });
        }

        return res.status(200).send({
            message: "Businesses found successfully",
            businesses,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Update Business
export const updateBusiness = async (req, res) => {
    try {
        const { name, address, state, city, entity, country } = req.body;
        const { _id_business } = req.query;
        const _id_user = req.user._id_user;

        const businessToUpdate = await Business.findOne({
            where: { _id_business },
        });

        if (!businessToUpdate) {
            return res.status(404).send({ message: "Business not found" });
        }

        if (businessToUpdate._id_user !== _id_user) {
            return res.status(403).send({
                message: "You are not authorized to update this business",
            });
        }

        businessToUpdate.name = name || businessToUpdate.name;
        businessToUpdate.address = address || businessToUpdate.address;
        businessToUpdate.state = state || businessToUpdate.state;
        businessToUpdate.city = city || businessToUpdate.city;
        businessToUpdate.entity = entity || businessToUpdate.entity;
        businessToUpdate.country = country || businessToUpdate.country;

        await businessToUpdate.save();

        return res.status(200).send({
            message: "Business updated successfully",
            business: businessToUpdate,
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

// Delete Business
export const deleteBusiness = async (req, res) => {
    try {
        const { _id_business } = req.query;
        const _id_user = req.user._id_user;

        const deletedBusiness = await Business.findOne({
            where: { _id_business },
        });

        if (!deletedBusiness) {
            return res.status(404).send({ message: "Business not found" });
        }

        if (deletedBusiness._id_user !== _id_user) {
            return res.status(403).send({
                message: "You are not authorized to delete this business",
            });
        }

        deletedBusiness.is_valid = false;
        await deletedBusiness.save();

        return res
            .status(200)
            .send({ message: "Business deleted successfully" });
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

// Search Business
export const searchBusiness = async (req, res) => {
    const { name, address, state, city, country, entity } = req.query;

    let searchCriteria = {
        is_valid: true,
    };

    if (name) {
        searchCriteria.name = {
            [Op.iLike]: `%${name}%`,
        };
    }
    if (address) {
        searchCriteria.address = {
            [Op.iLike]: `%${address}%`,
        };
    }
    if (state) {
        searchCriteria.state = {
            [Op.iLike]: `%${state}%`,
        };
    }
    if (city) {
        searchCriteria.city = {
            [Op.iLike]: `%${city}%`,
        };
    }
    if (country) {
        searchCriteria.country = {
            [Op.iLike]: `%${country}%`,
        };
    }
    if (entity) {
        searchCriteria.entity = {
            [Op.iLike]: `%${entity}%`,
        };
    }

    try {
        const businesses = await Business.findAll({
            where: searchCriteria,
            exclude: "_id_category",
            attributes: [
                "_id_business",
                "name",
                "entity",
                "address",
                "state",
                "city",
                "profile_picture_url",
                "country",
                "iso2_country_code",
                "iso2_state_code",
                [
                    Sequelize.literal(
                        '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."_id_business" = "Business"."_id_business" AND "reviews"."is_valid" = true)'
                    ),
                    "reviewsCount",
                ],
                "is_valid",
                "createdAt",
                "updatedAt",
            ],
            include: [
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                },
                {
                    model: Category,
                    attributes: ["_id_category", "name"],
                },
                {
                    model: Review,
                    attributes: ["rating"],
                    where: { is_valid: true },
                    required: false,
                },
            ],
        });

        const businessesWithStructure = await Promise.all(
            businesses.map(async (Business) => {
                const {
                    _id_user: _,
                    _id_category: __,
                    reviewsCount,
                    Reviews,
                    ...restBusinessDetails
                } = Business.get({ plain: true });

                const averageRating =
                    reviewsCount > 0 && Reviews
                        ? Reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                          ) / reviewsCount
                        : 0;

                const followersCount = await BusinessFollowers.count({
                    where: { _id_business: Business._id_business },
                });

                const businessCreator = Business.User || null;
                const businessCategory = Business.Category || null;

                return {
                    ...restBusinessDetails,
                    average_rating: averageRating,
                    reviewsCount,
                    followers: followersCount,
                    is_followed: false, // Set as false for the search
                    joinedAt: null, // No joinedAt for search results
                    User: businessCreator
                        ? businessCreator.get({ plain: true })
                        : null,
                    Category: businessCategory
                        ? businessCategory.get({ plain: true })
                        : null,
                };
            })
        );

        return res.status(200).send({
            message: "Businesses found successfully",
            businesses: businessesWithStructure,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            console.error(error);
            return res.status(500).send({
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
};

// Search Business Only By Name And Entity
export const searchBusinessByNameAndEntity = async (req, res) => {
    const { searchTerm } = req.query;

    let searchCriteria = {
        is_valid: true,
        [Op.or]: [],
    };

    if (searchTerm) {
        searchCriteria[Op.or].push({
            name: {
                [Op.iLike]: `%${searchTerm}%`,
            },
        });
        searchCriteria[Op.or].push({
            entity: {
                [Op.iLike]: `%${searchTerm}%`,
            },
        });
    }

    try {
        const businesses = await Business.findAll({
            where: searchCriteria,
            exclude: "_id_category",
            attributes: [
                "_id_business",
                "name",
                "entity",
                "address",
                "state",
                "city",
                "profile_picture_url",
                "country",
                "iso2_country_code",
                "iso2_state_code",
                [
                    Sequelize.literal(
                        '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."_id_business" = "Business"."_id_business" AND "reviews"."is_valid" = true)'
                    ),
                    "reviewsCount",
                ],
                "is_valid",
                "createdAt",
                "updatedAt",
            ],
            include: [
                {
                    model: User,
                    attributes: ["_id_user", "name", "last_name"],
                },
                {
                    model: Category,
                    attributes: ["_id_category", "name"],
                },
                {
                    model: Review,
                    attributes: ["rating"],
                    where: { is_valid: true },
                    required: false,
                },
            ],
        });

        const businessesWithStructure = await Promise.all(
            businesses.map(async (Business) => {
                const {
                    _id_user: _,
                    _id_category: __,
                    reviewsCount,
                    Reviews,
                    ...restBusinessDetails
                } = Business.get({ plain: true });

                const averageRating =
                    reviewsCount > 0 && Reviews
                        ? Reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                          ) / reviewsCount
                        : 0;

                const followersCount = await BusinessFollowers.count({
                    where: { _id_business: Business._id_business },
                });

                const businessCreator = Business.User || null;
                const businessCategory = Business.Category || null;

                return {
                    ...restBusinessDetails,
                    average_rating: averageRating,
                    reviewsCount,
                    followers: followersCount,
                    is_followed: false, // Set as false for the search
                    joinedAt: null, // No joinedAt for search results
                    User: businessCreator
                        ? businessCreator.get({ plain: true })
                        : null,
                    Category: businessCategory
                        ? businessCategory.get({ plain: true })
                        : null,
                };
            })
        );

        return res.status(200).send({
            message: "Businesses found successfully",
            businesses: businessesWithStructure,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error",
                errors: error.errors,
            });
        } else {
            console.error(error);
            return res.status(500).send({
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }
};

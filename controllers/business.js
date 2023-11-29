import { User } from "../models/users.js"
import { Business } from "../models/business.js";
import { Category } from "../models/categories.js";
import { Review } from "../models/reviews.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import Sequelize from "sequelize";
import { Op } from "sequelize";

// Create Business
export const createBusiness = async (req, res) => {
    try {
        const { name, entity, country, address, state, city, category } =
            req.body;
        const _id_user = req.user._id_user;

        const requiredFields = [
            "name",
            "entity",
            "country",
            "address",
            "state",
            "city",
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res
                    .status(400)
                    .send({ message: `Missing ${field} field` });
            }
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

        console.log("\n-- CATEGORY: ", categoryInstance._id_category);
        // Create business with category
        const createdBusiness = await Business.create({
            name,
            address,
            state,
            city,
            country,
            entity,
            _id_user,
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
            attributes: ['_id_user']
        });

        const followedBusinessesSet = new Set(followedBusinesses.map(followedBusiness => followedBusiness._id_user));

        const businesses = await Business.findAll({
            include: [{
                model: Review,
                include: [{
                    model: User,
                    attributes: ['name', 'last_name']
                }]
            }]
        });

        const feedData = await Promise.all(businesses.map(async (business) => {
            const averageRating = business.Reviews.reduce((acc, review) => acc + review.rating, 0) / business.Reviews.length;

            let mostLikedReview = null;
            let maxLikes = -1;
            for (let review of business.Reviews) {
                const likesCount = await ReviewLikes.count({
                    where: { _id_review: review._id_review }
                });
                if (likesCount > maxLikes) {
                    maxLikes = likesCount;
                    mostLikedReview = {
                        ...review.dataValues,
                        likes: likesCount,
                        User: {
                            name: review.User.name,
                            last_name : review.User.last_name
                        }
                    };
                }
            }

            const businessFollowStatus = followedBusinessesSet.has(business._id_business);

            return {
                Business: business.name,
                Review: mostLikedReview, 
                average_rating: averageRating,
                is_followed: businessFollowStatus
            };
        }));

        res.status(200).json({businesses: feedData});
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

export const getBusinessDetails = async (req, res) => {
    const { _id_business } = req.query;
    const _id_user = req.user._id_user;

    try {
        const business = await Business.findByPk(_id_business);

        if (!business) {
            return res.status(404).send({ message: "Business not found" });
        }

        const businessFollowStatus = await BusinessFollowers.findOne({
            where: {
                _id_business: _id_business,
                _id_user: _id_user
            }
        });

        return res.status(200).send({
            message: "Business retrieved successfully",
            business,
            is_followed: !!businessFollowStatus 
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
            limit: 20,
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
    const { name, address, state, city, country, entity, reviewCount } =
        req.query;

    let searchCriteria = {};

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
            include: Review,
        });

        if (reviewCount) {
            const filteredBusinesses = businesses.filter(
                (business) =>
                    business.Reviews && business.Reviews.length >= reviewCount
            );
            return res.status(200).send({ businesses: filteredBusinesses });
        }

        return res.status(200).send({ businesses });
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


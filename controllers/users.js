dotenv.config();
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op, Sequelize } from "sequelize";
import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Message } from "../models/messages.js";
import { Business } from "../models/business.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { ReviewImages } from "../models/reviewImages.js";
import { CommentLikes } from "../models/commentLikes.js";
import { sendOTP, verifyOTP } from "../middlewares/sms.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import { isValidEmail, isValidPhoneNumber } from "../utils/validations.js";
import {
    commentsMetaData,
    likesMetaData,
} from "../middlewares/reviewInteractions.js";
import { commentMetaData } from "../middlewares/commentInteractions.js";
import ReviewDTO from "../models/dto/review_dto.js";
import CommentDTO from "../models/dto/comment_dto.js";

export const createUser = async (req, res) => {
    try {
        const {
            name,
            last_name,
            email,
            phone_number,
            birth_date,
            gender,
            password,
            role,
            nick_name,
        } = req.body;

        // Check for empty fields
        const requiredFields = [
            "name",
            "last_name",
            "email",
            "birth_date",
            "gender",
            "password",
        ];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res
                    .status(400)
                    .send({ message: `Missing ${field} field` });
            }
        }

        if (!(await isValidEmail(email))) {
            return res.status(400).send({ message: "Invalid email format" });
        }

        if (!isValidPhoneNumber(phone_number)) {
            return res
                .status(400)
                .send({ message: "Invalid phone number format" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate default nick_name if not provided
        const defaultNickName =
            nick_name ||
            `${name.replace(/\s+/g, "")}${last_name.replace(
                /\s+/g,
                ""
            )}${Math.floor(1000 + Math.random() * 9000)}`;

        const [userCreated, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name,
                last_name,
                phone_number,
                birth_date,
                gender,
                password_token: hashedPassword,
                role: role ? "admin" : "consumer",
                nick_name: defaultNickName,
            },
        });

        if (!created) {
            return res.status(403).send({ message: "Email already in use" });
        }

        const userData = userCreated.get({ plain: true });
        delete userData.password_token;

        // Generate a JWT token
        const token = jwt.sign(
            { _id_user: userCreated._id_user },
            process.env.TOKEN_SECRET,
            { expiresIn: "3d" }
        );

        // TODO: Add email distribution

        res.status(200).send({
            message: "User created successfully",
            user: userData,
            token,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            // Handle Sequelize validation errors
            return res
                .status(400)
                .send({ message: "Validation error", errors: error.errors });
        } else {
            // Catch any other unexpected errors
            return res
                .status(500)
                .send({ message: "An unexpected error occurred" });
        }
    }
};

//Log In
export const logIn = async (req, res) => {
    const { client_email, client_password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                email: client_email,
            },
        });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(
            client_password,
            user.password_token
        );

        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { _id_user: user._id_user },
            process.env.TOKEN_SECRET,
            { expiresIn: "3d" }
        );

        res.status(200).send({
            message: "Login successful",
            token,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Update User
export const updateUser = async (req, res) => {
    const _id_user = req.user._id_user;

    const {
        name,
        last_name,
        email,
        phone_number,
        birth_date,
        gender,
        nick_name,
    } = req.body;
    try {
        const user = await User.findOne({ where: { _id_user } });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        if (
            email &&
            email !== user.email &&
            !(await isValidEmail(email, _id_user))
        ) {
            return res
                .status(400)
                .send({ message: "Invalid or already in use email address" });
        }

        if (phone_number && !isValidPhoneNumber(phone_number)) {
            return res.status(400).send({ message: "Invalid phone number" });
        }

        const updateData = {
            ...(name !== undefined && { name }),
            ...(last_name !== undefined && { last_name }),
            ...(email !== undefined && { email }),
            ...(phone_number !== undefined && { phone_number }),
            ...(birth_date !== undefined && { birth_date }),
            ...(gender !== undefined && { gender }),
            ...(nick_name !== undefined && { nick_name }),
        };

        await User.update(updateData, { where: { _id_user } });

        const updatedUser = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });

        res.status(200).send({
            message: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(`Error updating user: ${error.message}`);
        res.status(500).send({
            error: "An error occurred while updating the user",
        });
    }
};

//Get User Details
export const getUserDetails = async (req, res) => {
    const _id_user = req.query._id_user || req.user._id_user;
    const _id_user_requesting = req.user._id_user;  

    try {
        let user = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        const followingsCount = await UserFollowers.count({
            where: { _id_follower: _id_user },
        });

        const followersCount = await UserFollowers.count({
            where: { _id_followed: _id_user },
        });

        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });

        const isFollowed = userFollowings.some(following => following._id_followed === _id_user);

        user = user.toJSON();
        user.followings = followingsCount;
        user.followers = followersCount;
        user.is_followed = isFollowed; 

        res.status(200).send({
            message: "User found",
            user,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Like Review
export const likeReview = async (req, res) => {
    const _id_review = req.query._id_review;
    const _id_user = req.user._id_user;

    try {
        // Check if the review exists
        const review = await Review.findByPk(_id_review);
        if (!review || !review.is_valid) {
            return res.status(404).send({ message: "Review not found" });
        }

        // Check if the user has already liked the review
        const existingLike = await ReviewLikes.findOne({
            where: { _id_review, _id_user },
        });

        if (existingLike) {
            // If the like exists, remove it
            await existingLike.destroy();
            return res
                .status(200)
                .send({ message: "Review unliked successfully", liked: false });
        } else {
            // If the like doesn't exist, add it
            await ReviewLikes.create({ _id_review, _id_user });
            return res
                .status(200)
                .send({ message: "Review liked successfully", liked: true });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Like Comment
export const likeComment = async (req, res) => {
    const _id_comment = req.query._id_comment;
    const _id_user = req.user._id_user;

    try {
        const comment = await Comment.findOne({ where: { _id_comment } });
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        const existingLike = await CommentLikes.findOne({
            where: { _id_comment, _id_user },
        });

        if (existingLike) {
            // If the like exists, remove it
            await existingLike.destroy();
            return res.status(200).send({
                message: "Comment unliked successfully",
                liked: false,
            });
        } else {
            // If the like doesn't exist, add it
            await CommentLikes.create({ _id_comment, _id_user });
            return res
                .status(200)
                .send({ message: "Comment liked successfully", liked: true });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Follow User
export const followUser = async (req, res) => {
    const _id_followed = req.query._id_followed;
    const _id_follower = req.user._id_user;

    try {
        const alreadyFollows = await UserFollowers.findOne({
            where: {
                [Op.and]: [{ _id_follower }, { _id_followed }],
            },
        });

        if (alreadyFollows) {
            //Delete the following status
            await alreadyFollows.destroy();
            return res.status(200).send({
                message: "User unfollowed successfully",
                followed: false,
            });
        } else {
            // If follower doesn't follow user followed
            await UserFollowers.create({ _id_follower, _id_followed });
            return res.status(200).send({
                message: "User followed successfully",
                followed: true,
            });
        }
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).send({ message: "Invalid token" });
        }
        res.status(500).send({ error: error.message });
    }
};

//Follow Business
export const followBusiness = async (req, res) => {
    const _id_business = req.query._id_business;
    const _id_user = req.user._id_user;

    try {
        const alreadyFollows = await BusinessFollowers.findOne({
            where: {
                [Op.and]: [{ _id_user }, { _id_business }],
            },
        });

        if (alreadyFollows) {
            //Delete the following status
            await alreadyFollows.destroy();
            return res.status(200).send({
                message: "Business unfollowed successfully",
                followed: false,
            });
        } else {
            // If follower doesn't follow user followed
            await BusinessFollowers.create({ _id_user, _id_business });
            return res.status(200).send({
                message: "Business followed successfully",
                followed: true,
            });
        }
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).send({ message: "Invalid token" });
        }
        res.status(500).send({ error: error.message });
    }
};

//Deactivate User
export const deactivateUser = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        const user = await User.findOne({ where: { _id_user } });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        user.is_valid = false;
        await user.save();

        return res
            .status(200)
            .send({ message: "User deactivated successfully" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Nuke User (Cascade Deleting all user appearences)
export const nukeUser = async (req, res) => {
    const _id_user = req.user._id_user;
    const user = await User.findByPk(_id_user);
    try {
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Permission denied. Only admins can nuke users.",
            });
        }

        const reviews = await Review.findAll({
            where: { _id_user },
        });

        for (const review of reviews) {
            const imagesToDelete = await ReviewImages.findAll({
                where: { _id_review: review._id_review },
            });

            for (const image of imagesToDelete) {
                await image.destroy();
            }
        }

        await ReviewLikes.destroy({ where: { _id_user } });
        await CommentLikes.destroy({ where: { _id_user } });
        await BusinessFollowers.destroy({ where: { _id_user } });
        await UserFollowers.destroy({
            where: {
                [Op.or]: [
                    { _id_follower: _id_user },
                    { _id_followed: _id_user },
                ],
            },
        });
        await Message.destroy({
            where: {
                [Op.or]: [{ _id_sender: _id_user }, { _id_receiver: _id_user }],
            },
        });
        await Comment.destroy({ where: { _id_user } });
        await Review.destroy({ where: { _id_user } });
        await Business.destroy({ where: { _id_user } });
        await User.destroy({ where: { _id_user } });

        return res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// Send OTP
export const sendSMS = async (req, res) => {
    var phone_number = req.query.phone_number;
    const country_number = req.query.country_number;

    try {
        if (phone_number && !isValidPhoneNumber(phone_number)) {
            return res.status(400).send({ message: "Invalid phone number" });
        }

        phone_number = "+" + country_number + phone_number;

        await sendOTP(phone_number);

        console.log("OTP enviado exitosamente");
        return res.status(206).json({
            message: "Code verification sent successfully.",
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Verify OTP Code
export const VerifySMS = async (req, res) => {
    try {
        const code = req.query.code;
        var phone_number = req.query.phone_number;
        const country_number = req.query.country_number;

        phone_number = "+" + country_number + phone_number;

        const verificationCheck = await verifyOTP(phone_number, code);

        if (verificationCheck.status === "approved") {
            return res.status(200).json({
                message: "Success",
            });
        } else {
            return res.status(401).json({
                message: "Incorrect Code",
            });
        }
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({
                message: "Code expired or not found",
            });
        } else {
            return res.status(400).json({
                message: "Error with the verification process",
            });
        }
    }
};

// Search User
export const searchUser = async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const _id_user_requesting = req.user._id_user;

    let nameSearchCriteria = {};
    let lastNameSearchCriteria = {};

    if (searchTerm.includes(" ")) {
        const [providedName, providedLastName] = searchTerm.split(" ");
        nameSearchCriteria.name = {
            [Op.iLike]: `%${providedName}%`,
        };
        lastNameSearchCriteria.last_name = {
            [Op.iLike]: `%${providedLastName}%`,
        };
    } else {
        // If only one term is provided, search in both name and last name
        nameSearchCriteria.name = {
            [Op.iLike]: `%${searchTerm}%`,
        };
        lastNameSearchCriteria.last_name = {
            [Op.iLike]: `%${searchTerm}%`,
        };
    }

    try {
        const similarUsersByName = await User.findAll({
            where: nameSearchCriteria,
            attributes: {
                exclude: ["admin", "email", "phone_number", "password_token"],
            },
        });

        const similarUsersByLastName = await User.findAll({
            where: lastNameSearchCriteria,
            attributes: {
                exclude: ["admin", "email", "phone_number", "password_token"],
            },
        });

        const uniqueUsersMap = {};
        [...similarUsersByName, ...similarUsersByLastName].forEach((user) => {
            uniqueUsersMap[user._id_user] = user;
        });
        const combinedUsers = Object.values(uniqueUsersMap);

        if (combinedUsers.length === 0) {
            return res
                .status(404)
                .send({ message: "No users found matching the criteria" });
        }

        // Check if each user is followed by the requesting user
        const usersWithFollowStatus = await Promise.all(
            combinedUsers.map(async (user) => {
                const isFollower = await UserFollowers.findOne({
                    where: {
                        _id_follower: _id_user_requesting,
                        _id_followed: user._id_user,
                    },
                });
                return {
                    ...user.get({ plain: true }),
                    is_follower: Boolean(isFollower),
                };
            })
        );

        return res.status(200).send({
            message: "Successfully found users",
            users: usersWithFollowStatus,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            return res.status(400).send({
                message: "Validation error during user search",
                errors: error.errors,
            });
        } else {
            return res
                .status(500)
                .send({ message: "Internal Server Error during user search" });
        }
    }
};

// Verify Token
export const verifyToken = (req, res) => {
    // If the execution reaches here, the token is valid.
    res.status(200).json({
        success: true,
        message: "Token is valid",
    });
};

// Get User Feed with Pagination
export const getUserFeed = async (req, res) => {
    const _id_user = req.user._id_user;
    const { size = 10, currentDate, nextPage } = req.query;

    try {
        // Step 1: Get user details
        let user = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        // Step 2: Get all businesses the user follows
        const userBusinesses = await BusinessFollowers.findAll({
            where: { _id_user },
        });

        // Step 3: Iterate through each business and get the most liked review
        const feedPromises = userBusinesses.map(async (businessFollower) => {
            const businessId = businessFollower._id_business;

            // Step 3.1: Get all reviews for the current business
            const businessReviews = await Review.findAll({
                where: { _id_business: businessId },
                order: [["createdAt", "DESC"]],
            });

            // Step 3.2: Get the most liked review for each business
            const reviewsWithLikes = await Promise.all(
                businessReviews.map(async (review) => {
                    const likes = await ReviewLikes.count({
                        where: { _id_review: review._id_review },
                    });

                    // Get user information for the current review
                    const userForReview = await User.findOne({
                        where: { _id_user: review._id_user },
                        attributes: ["_id_user", "name", "last_name"],
                    });

                    // Get business information for the current review
                    const businessForReview = await Business.findOne({
                        where: { _id_business: review._id_business },
                        attributes: ["_id_business", "name", "entity"],
                    });

                    // Step 3.3: Get the number of comments for the current review
                    const comments = await Comment.count({
                        where: { _id_review: review._id_review },
                    });

                    return {
                        ...review.toJSON(),
                        likes,
                        comments,
                        User: {
                            _id_user: userForReview._id_user,
                            name: userForReview.name,
                            last_name: userForReview.last_name,
                        },
                        Business: {
                            _id_business: businessForReview._id_business,
                            name: businessForReview.name,
                            entity: businessForReview.entity,
                            is_followed: true,
                        },
                    };
                })
            );

            // Find the most liked review based on like count and timestamp
            const mostLikedReview = reviewsWithLikes.reduce((prev, current) => {
                if (
                    !prev ||
                    current.likeCount > prev.likeCount ||
                    (current.likeCount === prev.likeCount &&
                        current.createdAt > prev.createdAt)
                ) {
                    return current;
                } else {
                    return prev;
                }
            }, null);

            // Only add the object if mostLikedReview is truthy
            if (mostLikedReview) {
                return mostLikedReview;
            } else {
                return null;
            }
        });

        // Step 4: Execute all promises concurrently
        const feed = await Promise.all(feedPromises);

        // Filter out null objects
        const filteredFeed = feed.filter((item) => item !== null);

        // Pagination logic
        const startIndex = nextPage
            ? filteredFeed.findIndex((item) => item.createdAt < nextPage)
            : 0;
        const endIndex = startIndex + size;
        const paginatedFeed = filteredFeed.slice(startIndex, endIndex);

        // Calculate next date for the next batch
        const nextBatchFirstReviewDate =
            paginatedFeed.length > 0
                ? paginatedFeed[paginatedFeed.length - 1].createdAt
                : null;

        // Calculate total pages
        const totalPages = Math.ceil(filteredFeed.length / size);

        res.status(200).send({
            message: "User found",
            businessReviews: paginatedFeed,
            size: paginatedFeed.length,
            currentDate: nextBatchFirstReviewDate
                ? nextBatchFirstReviewDate
                : currentDate,
            nextDate: nextBatchFirstReviewDate,
            totalPages,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get Liked Reviews By User
export const getUserLikes = async (req, res) => {
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
                    as: "businessFollowers", // This alias should match the alias used in User.belongsToMany
                    through: {
                        model: BusinessFollowers,
                        attributes: [], // Exclude any additional attributes from BusinessFollowers
                    },
                    required: false, // Change to true if you only want reviews where the user is following at least one business
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

        const reviewsWithLikesAndFollowInfo = await Promise.all(allReviews.map(
            async (review, index) => {
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

                const Images = await ReviewImages.findAll({
                    where: {_id_review: reviewDTO._id_review},
                    attributes: ['image_url']
                });
                for (const image of Images) {
                    reviewDTO.setImages(image.image_url);
                }

                return reviewDTO.getReviewData();
            }
        ));

        res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
        });
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

// Get Reviews for User
export const getUserReviews = async (req, res) => {
    let _id_user = req.query._id_user;

    if (!_id_user) {
        _id_user = req.user._id_user;
    }

    const _id_user_requesting = req.user._id_user;

    try {
        const userReviews = await Review.findAll({
            where: { _id_user, is_valid: true },
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

        if (!userReviews.length) {
            // No reviews found for the user
            return res.status(200).send({
                message: "No reviews found for the user",
                reviews: [],
            });
        }

        const commentsDTO = await commentsMetaData(userReviews);
        const likesDTO = await likesMetaData(userReviews, _id_user_requesting);
        const userFollowings = await UserFollowers.findAll({
            where: { _id_follower: _id_user_requesting },
        });
        const businessFollowings = await BusinessFollowers.findAll({
            where: { _id_user: _id_user_requesting },
        });

        const likesMap = new Map(
            likesDTO.map((like) => [like.dataValues._id_review, like])
        );

        const reviewsWithLikesAndFollowInfo = await Promise.all(userReviews.map(
            async (review, index) => {
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

                const Images = await ReviewImages.findAll({
                    where: {_id_review: reviewDTO._id_review},
                    attributes: ['image_url']
                });
                for (const image of Images) {
                    reviewDTO.setImages(image.image_url);
                }

                return reviewDTO.getReviewData();
            }
        ));

        res.status(200).send({
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
            message: "Reviews retrieved successfully",
            reviews: reviewsWithLikesAndFollowInfo,
        });
    } catch (error) {
        if (error.name === "SequelizeEmptyResultError") {
            // User not found
            return res.status(404).send({ message: "User not found" });
        }

        console.error("Error retrieving reviews:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

//Get User Comments
export const getUserComments = async (req, res) => {
    const _id_user_requesting = req.user._id_user;
    let _id_user = req.query._id_user || _id_user_requesting;

    try {
        const userComments = await Comment.findAll({
            where: { _id_user: _id_user, is_valid: true },
            limit: 20,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["_id_user", "name", "last_name", "nick_name"],
                },
            ],
        });

        const { likesMetaDataObject, repliesMetaDataObject } =
            await commentMetaData(userComments, _id_user_requesting);

        const userFollowingsSet = new Set(
            (
                await UserFollowers.findAll({
                    where: { _id_follower: _id_user_requesting },
                })
            ).map((following) => following._id_followed)
        );

        const transformedComments = userComments.map((comment) => {
            const commentDTO = new CommentDTO(comment, _id_user_requesting);
            commentDTO.setMetaData(
                likesMetaDataObject,
                repliesMetaDataObject,
                userFollowingsSet
            );
            return commentDTO.getCommentData();
        });

        res.status(200).send({
            message: "Comments retrieved successfully",
            comments: transformedComments,
        });
    } catch (error) {
        console.error("Error retrieving comments:", error);
        res.status(500).send({ message: "Internal server error" });
    }
};

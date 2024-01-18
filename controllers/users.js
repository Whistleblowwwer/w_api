dotenv.config();
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/users.js";
import { Op, Sequelize } from "sequelize";
import {
    commentsMetaData,
    likesMetaData,
} from "../middlewares/reviewInteractions.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { Message } from "../models/messages.js";
import { Business } from "../models/business.js";
import ReviewDTO from "../models/dto/review_dto.js";
import CommentDTO from "../models/dto/comment_dto.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { ReviewImages } from "../models/reviewImages.js";
import { Category } from "../models/categories.js";
import { CommentLikes } from "../models/commentLikes.js";
import { CommentImages } from "../models/commentImages.js";
import { UserFollowers } from "../models/userFollowers.js";
import { filterBadWords } from "../middlewares/badWordsFilter.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import { commentMetaData } from "../middlewares/commentInteractions.js";
import { validateOTP, sendOTPByEmail } from "../middlewares/mailMain.js";
import { isValidEmail, isValidPhoneNumber } from "../utils/validations.js";

// Registrate User
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

        // Check for profanity in relevant fields
        const containsBadWord = await filterBadWords(
            `${name} ${last_name} ${email} ${phone_number} ${gender} ${nick_name}`
        );
        if (containsBadWord) {
            return res
                .status(400)
                .send({ message: "Contenido contiene palabras prohibidas" });
        }

        if (!(await isValidEmail(email))) {
            return res.status(400).send({ message: "Invalid email format" });
        }

        if (phone_number && !isValidPhoneNumber(phone_number)) {
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

// Validate OTP
export const validateOtp = async (req, res) => {
    try {
        const { code, email } = req.body;
        if (!code || !email) {
            return res
                .status(400)
                .json({ message: "Missing code or email field" });
        }

        const isValidOTP = validateOTP(email, code);

        if (isValidOTP) {
            res.status(200).json({
                message: "Validation successful!",
            });
        } else {
            res.status(400).json({
                message: "Could not validate code. Please try again.",
            });
        }
    } catch (error) {
        console.error("Error in validateOtp:", error.message);
        res.status(500).json({
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

// Request OTP
export const requestOtp = async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({
                message: "Email parameter is missing",
            });
        }

        if (!(await isValidEmail(email))) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        // Send OTP via email
        await sendOTPByEmail(email);

        res.status(200).json({
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Error in requestOtp:", error);

        res.status(500).json({
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

//Change User Password
export const changeUserPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!newPassword) {
            return res
                .status(400)
                .json({ message: "New password is required" });
        }

        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_token = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error in changing password:", error.message);
        res.status(500).json({
            message: "An unexpected error occurred",
            error: error.message,
        });
    }
};

// Log In
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

// Update User
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

// Get User Details
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

        const isFollowed = userFollowings.some(
            (following) => following._id_followed === _id_user
        );

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

// Like Review
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

// Like Comment
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

// Follow User
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

// Follow Business
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

// Deactivate User
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

// Nuke User (Cascade Deleting all user appearences)
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

// Search User
export const searchUser = async (req, res) => {
    const searchTerm = req.query.searchTerm;
    const _id_user_requesting = req.user._id_user;

    let nameSearchCriteria = {
        is_valid: true,
    };
    let lastNameSearchCriteria = {
        is_valid: true,
    };

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
export const verifyToken = async (req, res) => {
    try {
        const _id_user = req.user._id_user;

        const user = await User.findByPk(_id_user);

        if (user) {
            if (user.is_valid) {
                res.status(200).json({
                    success: true,
                    message: "Token is valid",
                });
            } else {
                res.status(403).json({
                    success: false,
                    message:
                        "User is not validated. Please validate your account.",
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
    } catch (error) {
        console.error("Error in verifyToken:", error);

        // Handle unexpected errors
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred",
        });
    }
};

// Get Liked Reviews By User
export const getUserLikes = async (req, res) => {
    const _id_user_requesting = req.user._id_user;

    try {
        const allLikedReviews = await User.findOne({
            where: {
                _id_user: _id_user_requesting,
            },
            include: [
                {
                    model: Review,
                    as: "LikedReviews",
                    include: [
                        {
                            model: Business,
                            attributes: ["_id_business", "name", "entity"],
                        },
                        {
                            model: User,
                            attributes: [
                                "_id_user",
                                "name",
                                "last_name",
                                "nick_name",
                            ],
                        },
                        {
                            model: ReviewImages,
                            attributes: ["image_url"],
                        },
                    ],
                },
            ],
        });

        const commentsDTO = await commentsMetaData(
            allLikedReviews.LikedReviews
        );
        const likesDTO = await likesMetaData(
            allLikedReviews.LikedReviews,
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

        const reviewsWithLikesAndFollowInfo = allLikedReviews.LikedReviews.map(
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

// Get Reviews made by User
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

        const reviewsWithLikesAndFollowInfo = await Promise.all(
            userReviews.map(async (review, index) => {
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

// Get User Comments
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
                    model: CommentImages,
                    attributes: ["image_url"],
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

            const imageUrls = comment.CommentImages.map(
                (image) => image.image_url
            );
            commentDTO.setImages(imageUrls);
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

// Get 5 Random user recommendations
export const getRandomUsers = async (req, res) => {
    const _id_user_requesting = req.user._id_user;

    try {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentReviews = await Review.findAll({
            where: {
                createdAt: {
                    [Op.gte]: threeMonthsAgo,
                },
            },
            include: {
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
            limit: 100,
        });

        const uniqueUsers = new Map();
        recentReviews.forEach((review) => {
            if (!uniqueUsers.has(review.User._id_user)) {
                uniqueUsers.set(review.User._id_user, review.User);
            }
        });

        let usersArray = Array.from(uniqueUsers.values());
        for (
            let currentIndex = usersArray.length - 1;
            currentIndex > 0;
            currentIndex--
        ) {
            const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
            [usersArray[currentIndex], usersArray[randomIndex]] = [
                usersArray[randomIndex],
                usersArray[currentIndex],
            ];
        }

        const randomUsers = usersArray.slice(0, 5);

        const followStatusPromises = randomUsers.map(async (user) => {
            const isFollowed = await UserFollowers.findOne({
                where: {
                    _id_follower: _id_user_requesting,
                    _id_followed: user._id_user,
                },
            });
            return { ...user.toJSON(), is_followed: !!isFollowed };
        });

        const usersWithFollowStatus = await Promise.all(followStatusPromises);

        res.status(200).send({
            message: "Random user recommendations",
            users: usersWithFollowStatus,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

// Block another User
export const blockUser = async (req, res) => {
    const { _id_user_to_block } = req.query;
    const _id_user_unblocking = req.user._id_user;
    console.log("\n --ID QUERY: ", _id_user_to_block);
    try {
        const userToBlock = await User.findByPk(_id_user_to_block);

        if (!userToBlock) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("\n -- BLOCKED BY: ", userToBlock.blockedBy);
        // Check if the user is already blocked
        if (userToBlock.blockedBy.includes(_id_user_unblocking)) {
            return res.status(400).json({ message: "User is already blocked" });
        }

        // Block the user
        userToBlock.blockedBy.push(_id_user_unblocking);
        await User.update(
            { blockedBy: [...userToBlock.blockedBy, _id_user_unblocking] },
            { where: { _id_user: _id_user_to_block } }
        );

        console.log("\n -- BLOCKED BY: ", userToBlock.blockedBy);
        return res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.error("Error blocking user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Unblock another User
export const unBlockUser = async (req, res) => {
    const { _id_user_to_unblock } = req.query;
    const _id_user_unblocking = req.user._id_user;

    try {
        const userToUnblock = await User.findByPk(_id_user_to_unblock);

        if (!userToUnblock) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is blocked
        if (!userToUnblock.blockedBy.includes(_id_user_unblocking)) {
            return res.status(400).json({ message: "User is not blocked" });
        }

        // Unblock the user
        userToUnblock.blockedBy = userToUnblock.blockedBy.filter(
            (id) => id !== _id_user_unblocking
        );

        await User.update(
            {
                blockedBy: userToUnblock.blockedBy.filter(
                    (id) => id !== _id_user_unblocking
                ),
            },
            { where: { _id_user: _id_user_to_unblock } }
        );

        return res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("Error unblocking user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get Followed Businesses
export const getFollowedBusinesses = async (req, res) => {
    const _id_user = req.user._id_user;

    try {
        // Find businesses that the user follows
        const followedBusinesses = await BusinessFollowers.findAll({
            where: { _id_user },
            include: [
                {
                    model: Business,
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
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        console.log("\n -- FOLLOWED BUSINESSES", followedBusinesses);
        if (followedBusinesses.length === 0) {
            return res
                .status(404)
                .send({ message: "No followed businesses found" });
        }

        // Extract business details from the joined data
        const businesses = await Promise.all(
            followedBusinesses.map(async ({ Business, createdAt }) => {
                console.log("\n -- BUSINESS: ", Business);
                const {
                    _id_user: _,
                    _id_category: __,
                    reviewsCount,
                    Reviews, // Access the Reviews directly
                    ...restBusinessDetails
                } = Business.get({ plain: true });

                const averageRating =
                    reviewsCount > 0 && Reviews
                        ? Reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                          ) / reviewsCount
                        : 0;

                // Fetch the count of followers for each business
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
                    is_followed: true,
                    joinedAt: createdAt,
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
            message: "Followed businesses found successfully",
            businesses,
        });
    } catch (error) {
        return res.status(500).send({
            message: "Internal server error",
            error: error.message,
        });
    }
};

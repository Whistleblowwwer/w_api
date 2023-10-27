import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { Comment } from "../models/comments.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { CommentLikes } from "../models/commentLikes.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPhoneNumber } from "../utils/validations.js";
import { Op } from "sequelize";
import { sendOTP, verifyOTP } from "../middlewares/sms.js";

//Create new user
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
        } = req.body;

        // Check for empty fields
        const requiredFields = [
            "name",
            "last_name",
            "email",
            "phone_number",
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

        const userMail = await User.findOne({ where: { email } });
        if (userMail) {
            return res.status(403).send({ message: "Email already in use" });
        }

        if (!(await isValidEmail(email))) {
            return res.status(400).send({ message: "Invalid email format" });
        }

        if (!isValidPhoneNumber(phone_number)) {
            return res
                .status(400)
                .send({ message: "Invalid phone number format" });
        }

        const userPhone = await User.findOne({ where: { phone_number } });
        if (userPhone) {
            return res
                .status(403)
                .send({ message: "Phone number already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            last_name,
            email,
            phone_number,
            birth_date,
            gender,
            password_token: hashedPassword,
        });

        // Generate a JWT token
        const token = jwt.sign(
            { _id_user: user._id_user },
            process.env.TOKEN_SECRET,
            { expiresIn: "3d" }
        );

        //TODO: Add email distribution

        // Return the created user and JWT token
        const createdUser = await User.findOne({
            where: { _id_user: user._id_user },

            attributes: { exclude: user.password_token },
        });

        res.status(200).send({
            message: "User created successfully",
            user: createdUser,
            token,
        });
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            // Handle Sequelize validation errors
            return res
                .status(400)
                .send({ message: "Validation error", errors: error.errors });
        } else if (error instanceof Error) {
            // Handle other types of errors
            return res.status(500).send({ message: "Internal Server Error" });
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

// Update User
export const updateUser = async (req, res) => {
    const _id_user = req.query._id_user;
    const { name, last_name, email, phone_number, birth_date, gender } =
        req.body;

    try {
        // Find the user
        let user = await User.findOne({ where: { _id_user } });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        // if (email !== user.email && !(await isValidEmail(email, _id_user))) {
        //     return res
        //         .status(400)
        //         .send({ message: "Invalid or already in use email address" });
        // }

        if (phone_number && !isValidPhoneNumber(phone_number)) {
            return res.status(400).send({ message: "Invalid phone number" });
        }

        await User.update(
            {
                name,
                last_name,
                email,
                phone_number,
                birth_date,
                gender,
            },
            { where: { _id_user } }
        );

        user = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });

        res.status(200).send({ message: "User updated successfully", user });
    } catch (error) {
        console.error(`Error updating user`);
        res.status(500).send({ error: error.message });
    }
};

//Get User Details
export const getUserDetails = async (req, res) => {
    const _id_user = req.query._id_user;

    try {
        const user = await User.findOne({
            where: { _id_user },
            attributes: { exclude: ["password_token"] },
        });

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        res.status(200).send({ message: "User found", user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

//Like Review
export const likeReview = async (req, res) => {
    const _id_review = req.params._id_review;
    const _id_user = req.user._id_user;

    try {
        // Check if the review exists
        const review = await Review.findOne({ where: { _id_review } });
        if (!review) {
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
    const _id_comment = req.params._id_comment;
    const _id_user = req.user._id_user;

    try {
        const comment = await Comment.findOne({ where: { _id_comment} });
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        const existingLike = await CommentLikes.findOne({
            where: { _id_comment, _id_user },
        });

        if (existingLike) {
            // If the like exists, remove it
            await existingLike.destroy();
            return res
                .status(200)
                .send({ message: "Comment unliked successfully", liked: false });
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
    const _id_followed = req.params._id_followed;
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
    const _id_business = req.params._id_business;
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

    let nameSearchCriteria = {};
    let lastNameSearchCriteria = {};

    if (searchTerm.includes(" ")) {
        const [providedName, providedLastName] = searchTerm.split(" ");
        nameSearchCriteria.name = {
            [Op.like]: `%${providedName}%`,
        };
        lastNameSearchCriteria.last_name = {
            [Op.like]: `%${providedLastName}%`,
        };
    } else {
        // If only one term is provided, search in both name and last name
        nameSearchCriteria.name = {
            [Op.like]: `%${searchTerm}%`,
        };
        lastNameSearchCriteria.last_name = {
            [Op.like]: `%${searchTerm}%`,
        };
    }

    try {
        const similarUsersByName = await User.findAll({
            where: nameSearchCriteria,
            attributes: { exclude: ["phone_number", "password_token"] },
        });

        const similarUsersByLastName = await User.findAll({
            where: lastNameSearchCriteria,
            attributes: { exclude: ["phone_number", "password_token"] },
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

        return res.status(200).send({
            message: "Successfully found users",
            users: combinedUsers,
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

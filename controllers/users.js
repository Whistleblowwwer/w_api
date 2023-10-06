import { User } from "../models/users.js";
import { Review } from "../models/reviews.js";
import { ReviewLikes } from "../models/reviewLikes.js";
import { UserFollowers } from "../models/userFollowers.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
// import { CommentLikes } from "../models/commentLikes.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPhoneNumber } from '../utils/validations.js';
import { Op } from 'sequelize';
import { sendOTP, verifyOTP } from "../middlewares/sms.js";

//Create new user
export const createUser = async (req, res) => {
    const { name, last_name, email, phone_number, birth_date, gender, password } = req.body;

    if (!await isValidEmail(email)) {
        return res.status(400).send({ message: "Invalid email format or email already in use" });
    }

    if (!isValidPhoneNumber(phone_number)) {
        return res.status(400).send({ message: "Invalid phone number format" });
    }
    
    const passwordRegex = /^(?=.*[a-záéíóúñ])(?=.*[A-ZÁÉÍÓÚÑ])(?=.*\d)[a-zA-ZáéíóúñÁÉÍÓÚÑ\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).send({ message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, last_name, email, phone_number, birth_date, gender, password_token: hashedPassword });

        // Generate a JWT token
        const token = jwt.sign({ _id_user: user._id_user }, process.env.TOKEN_SECRET, { expiresIn: '3d' });

        //await sendEmail(email, "Welcome to Our Platform", "Thank you for registering!");

        // Return the created user and JWT token
        const createdUser = await User.findOne({ where: { _id_user: user._id_user }, attributes: { exclude: ['password_token'] } });// Excluding hashed pw
        res.status(200).send({ message: "User created successfully", user: createdUser, token });


    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};


//Log In
export const logIn = async (req,res) => {
    const { identifier, password } = req.body; //User can login with email or phone number (identifier)

    try {
        // Email / Phone Number
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [{ email: identifier }, { phone_number: identifier }] 
            } 
        });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_token);
        if (!isPasswordValid) {
            return res.status(401).send({ message: "Invalid password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ _id_user: user._id_user }, process.env.TOKEN_SECRET, { expiresIn: '3d' });

        const loggedInUser = await User.findOne({ where: { _id_user: user._id_user }, attributes: { exclude: ['password_token'] } });// Excluding hashed pw
        res.status(200).send({ message: "Login successful", user: loggedInUser, token });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

// Update User
export const updateUser = async (req, res) => {
    const _id_user = req.user._id_user; // Getting id from middleware (Validate Token)
    const { name, last_name, email, phone_number, birth_date, gender, password } = req.body;

    try {
        // Find the user
        let user = await User.findOne({ where: { _id_user } });
        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        if (email !== user.email && !await isValidEmail(email, _id_user)) {
            return res.status(400).send({ message: "Invalid or already in use email address" });
        }
        
        if (phone_number && !isValidPhoneNumber(phone_number)) {
            return res.status(400).send({ message: "Invalid phone number" });
        }

        // Hash new pw
        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Update user
        await User.update(
            {
                name,
                last_name,
                email,
                phone_number,
                birth_date,
                gender,
                password_token: hashedPassword || user.password_token
            },
            { where: { _id_user } }
        );

        // Get the updated user details
        user = await User.findOne({ where: { _id_user }, attributes: { exclude: ['password_token'] } }); // Excluding hashed pw

        res.status(200).send({ message: "User updated successfully", user });

    } catch (error) {
        console.error(`Error updating user`); 
        res.status(500).send({ error: error.message });
    }
};

//Get User Details
export const getUserDetails = async (req, res) => {
    const _id_user = req.user._id_user; // Getting id from middleware (Validate Token)

    try {
        const user = await User.findOne({ where: { _id_user }, attributes: { exclude: ['password_token'] } }); // Excluding hashed pw

        if (!user) {
            return res.status(400).send({ message: "User not found" });
        }

        res.status(200).send({ message: "User details", user });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

export const likeReview = async (req, res) => {
    const _id_review = req.params._id_review;
    const _id_user = req.user._id_user; // Getting id from middleware (Validate Token)

    try {
        // Check if the review exists
        const review = await Review.findOne({ where: { _id_review } });
        if (!review) {
            return res.status(404).send({ message: "Review not found" });
        }

        // Check if the user has already liked the review
        const existingLike = await ReviewLikes.findOne({ where: { _id_review, _id_user } });

        if (existingLike) {
            // If the like exists, remove it
            await existingLike.destroy();
            return res.status(200).send({ message: "Review unliked successfully", liked: false });
        } else {
            // If the like doesn't exist, add it
            await ReviewLikes.create({ _id_review, _id_user });
            return res.status(200).send({ message: "Review liked successfully", liked: true });
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
                [Op.and]: [{ _id_follower }, { _id_followed }]
            }
        });

        if (alreadyFollows) {
            //Delete the following status
            await alreadyFollows.destroy();
            return res.status(200).send({ message: "User unfollowed successfully", followed: false });
        } else {
            // If follower doesn't follow user followed
            await UserFollowers.create({ _id_follower, _id_followed });
            return res.status(200).send({ message: "User followed successfully", followed: true });
        }

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ message: "Invalid token" });
        }
        res.status(500).send({ error: error.message });
    }
};

//Follow Business
export const followBusiness = async(req, res) => {
    const _id_business = req.params._id_business;
    const _id_user = req.user._id_user;

    try {
        const alreadyFollows = await BusinessFollowers.findOne({ 
            where: {
                [Op.and]: [{ _id_user  }, { _id_business }]
            }
        });

        if (alreadyFollows) {
            //Delete the following status
            await alreadyFollows.destroy();
            return res.status(200).send({ message: "Business unfollowed successfully", followed: false });
        } else {
            // If follower doesn't follow user followed
            await BusinessFollowers.create({ _id_user, _id_business });
            return res.status(200).send({ message: "Business followed successfully", followed: true });
        }

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ message: "Invalid token" });
        }
        res.status(500).send({ error: error.message });
    }

};

//Deactivate User
export const deactivateUser = async (req, res) => {
    const _id_user = req.user._id_user; // Get user ID from JWT token

    try {
        // Find the user by ID
        const user = await User.findOne({ where: { _id_user } });

        // If user not found, return a 404 error
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // Update the user's isActive status to false
        user.isActive = false;
        await user.save();

        return res.status(200).send({ message: "User deactivated successfully" });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Send OTP
export const sendSMS = async (req,res) => {
    var phone_number = req.query.phone_number; 
    const country_number = req.query.country_number;

    try{
        if (phone_number && !isValidPhoneNumber(phone_number)) {
            return res.status(400).send({ message: "Invalid phone number" });
        }

        phone_number = '+' + country_number + phone_number;

        await sendOTP(phone_number);

        console.log("OTP enviado exitosamente");
        return res.status(206).json({
            message:
            "Code verification sent successfully.",
        });

    }
    catch(error){
        res.status(500).send({ error: error.message });
    }
};

// Verify OTP Code
export const VerifySMS = async (req, res) => {
    try{
        const code = req.query.code;
        var phone_number = req.query.phone_number;
        const country_number = req.query.country_number;

        phone_number = '+' + country_number + phone_number;
        
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
    }
    catch(error){
        if (error.status === 404) {
            return res.status(404).json({
                message: "Code expired or not found",
            });
        } 
        else {
            return res.status(400).json({
                message: "Error with the verification process",
            });
        }
    }
    
};


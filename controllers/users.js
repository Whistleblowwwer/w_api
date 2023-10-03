import { User } from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPhoneNumber } from '../utils/validations.js';

export const createUser = async (req, res) => {
    const { name, last_name, email, phone_number, birth_date, gender, password_token } = req.body;

    if (!await isValidEmail(email)) {
        return res.status(400).send({ message: "Invalid email format or email already in use" });
    }

    if (!isValidPhoneNumber(phone_number)) {
        return res.status(400).send({ message: "Invalid phone number format or phone already in use" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password_token, salt);

        const user = await User.create({ name, last_name, email, phone_number, birth_date, gender, password_token: hashedPassword });

        // Generate a JWT token
        const token = jwt.sign({ _id_user: user._id_user }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

        // Return the created user and JWT token
        res.status(200).send({ message: "User created successfully", user, token });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    const _id_user = req.params._id_user;
    const { name, last_name, email, phone_number, birth_date, gender, password_token } = req.body;

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

        // Hash new password
        let hashedPassword;
        if (password_token) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password_token, salt);
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

//Log In

//Get User Details

//Like Review

//Follow User

//Follow Business

//Deactivate User




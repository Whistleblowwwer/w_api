import { User } from "../models/users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPhoneNumber } from '../utils/validations.js';
import { Op } from 'sequelize';

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
        const token = jwt.sign({ _id_user: user._id_user }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

        //await sendEmail(email, "Welcome to Our Platform", "Thank you for registering!");

        // Return the created user and JWT token
        res.status(200).send({ message: "User created successfully", user, token });

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
        const token = jwt.sign({ _id_user: user._id_user }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        res.status(200).send({ message: "Login successful", user, token}); 
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

// Update User
export const updateUser = async (req, res) => {
    const _id_user = req.params._id_user;
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

//Like Review

//Follow User

//Follow Business

//Deactivate User




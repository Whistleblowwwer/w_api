import { User } from "../models/users.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();


export const createUser = async (req, res) => {
    try {
        const {
            name,
            last_name,
            phone,
            email,
            profile_picture,
            password,
            specialty,
            role,
        } = req.body;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            token: token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
};

// export const createUser = async (req, res) => {
//     try {
//         const {
//             name,
//             last_name,
//             phone,
//             email,
//             profile_picture,
//             password,
//             specialty,
//             role,
//         } = req.body;

//         res.status(201).json({
//             success: true,
//             message: "User created successfully",
//             user: newUser,
//             token: token,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create user",
//             error: error.message,
//         });
//     }
// };


import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const validateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid token" });
        }

        req.user = decodedToken;
        next();
    });
};

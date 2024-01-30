import axios from "axios";
import RequestDTO from "../models/dto/request_dto.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// This function gathers the ip address and geolocation info for a request.
export const getIpInfo = async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;

    const url = `https://freeipapi.com/api/json/${ipAddress}`;
    const response = await axios.get(url);

    // Construct RequestDTO
    const requestDTO = new RequestDTO(req, response.data);

    // Extract user-agent from headers
    const userAgent = req.headers["user-agent"];

    // Check if the request is from a mobile device
    const isMobile = /Mobi|Android|iOS/.test(userAgent);

    // Identify the device type
    let deviceType = "Unknown";
    if (isMobile) {
        deviceType = /Android/.test(userAgent)
            ? "Android"
            : /iPhone|iPad|iPod/.test(userAgent)
            ? "iOS"
            : "Mobile";
    } else {
        deviceType = "Desktop";
    }

    console.log("\n-- DEVICE TYPE: ", deviceType);

    // Add device information to the requestDTO
    requestDTO.deviceType = deviceType;

    // Attach RequestDTO to req object
    req.requestDTO = requestDTO;

    next();
};

export const paintBall = async (req, res, next) => {
    console.log("IS THERE USER: ", req.user);
    next();
};

export const validateUser = (req, res, next) => {
    const token =
        req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        req.requestDTO.errorLog("No token provided");

        return res
            .status(401)
            .json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            // Handle JWT validation errors
            console.error("JWT validation error:", err.message);

            req.requestDTO.errorLog(err.message);

            return res
                .status(401)
                .json({ success: false, message: "Invalid token" });
        }

        req.user = decodedToken;

        req.requestDTO.setUserId(req.user._id_user);
        req.requestDTO.requestLog();

        next();
    });
};

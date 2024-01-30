import axios from "axios";
import RequestDTO from "../models/dto/request_dto.js";

// This function gathers the ip address and geolocation info for a request.
export const ipInfo = async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;

    const url = `https://freeipapi.com/api/json/${ipAddress}`;
    const response = await axios.get(url);

    // Construct RequestDTO
    const requestDTO = new RequestDTO(req, response.data);
    // Attach RequestDTO to req object
    req.requestDTO = requestDTO;

    next();
};

export const makeLog = async (req, res, next) => {
    req.requestDTO.setUserId(req.user._id_user);
    req.requestDTO.requestLog();
    next();
};

// IPMiddleware.js
import axios from "axios";
import Log from "../models/requestsLogs.js";

export const IpInfo = async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;
    console.log("\n -- QUERY ROUTE: ", req.originalUrl);

    try {
        const url = `https://freeipapi.com/api/json/${ipAddress}`;
        const response = await axios.get(url);

        console.log("\n -- DATA: ", response.data);

        // Store log data in the database
        await Log.create({
            continent: response.data.continent,
            continentCode: response.data.continentCode,
            country: response.data.countryName,
            countryCode: response.data.countryCode,
            city: response.data.cityName,
            zip: response.data.zipCode,
            lat: response.data.latitude,
            lon: response.data.longitude,
            timezone: response.data.timeZone,
            offset: response.data.offset,
            requestMethod: req.method,
            queryRoute: req.originalUrl,
            _ip_address: ipAddress,
        });
    } catch (error) {
        console.error("Error fetching IP geolocation:", error.message);
    }

    next();
};

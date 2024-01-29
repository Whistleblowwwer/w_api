import ErrorLog from "../errorsLogs.js";
import Log from "../requestsLogs.js";

export default class RequestDTO {
    constructor(req, geoLocation) {
        this.continent = geoLocation.continent;
        this.continentCode = geoLocation.continentCode;
        this.country = geoLocation.countryName;
        this.countryCode = geoLocation.countryCode;
        this.city = geoLocation.cityName;
        this.zip = geoLocation.zipCode;
        this.lat = geoLocation.latitude;
        this.lon = geoLocation.longitude;
        this.timezone = geoLocation.timeZone;
        this.offset = geoLocation.offset;
        this.requestMethod = req.method;
        this.queryRoute = req.originalUrl;
        this._ip_address = req.ip || req.connection.remoteAddress;
        this._id_user = null;
        this.error = null;
    }

    // Setter for user ID
    setUserId(userId) {
        this._id_user = userId;
    }

    // Setter for error
    setError(error) {
        this.error = error;
    }

    async errorLog(errorMessage) {
        try {
            const errorLogData = {
                continent: this.continent,
                continentCode: this.continentCode,
                country: this.country,
                countryCode: this.countryCode,
                city: this.city,
                zip: this.zip,
                lat: this.lat,
                lon: this.lon,
                timezone: this.timezone,
                offset: this.offset,
                requestMethod: this.requestMethod,
                queryRoute: this.queryRoute,
                _ip_address: this._ip_address,
                _id_user: this._id_user,
                error: errorMessage,
            };

            await ErrorLog.create(errorLogData);
        } catch (error) {
            console.error("Error logging error:", error.message);
        }
    }

    async requestLog() {
        try {
            const requestLogData = {
                continent: this.continent,
                continentCode: this.continentCode,
                country: this.country,
                countryCode: this.countryCode,
                city: this.city,
                zip: this.zip,
                lat: this.lat,
                lon: this.lon,
                timezone: this.timezone,
                offset: this.offset,
                requestMethod: this.requestMethod,
                queryRoute: this.queryRoute,
                _ip_address: this._ip_address,
                _id_user: this._id_user,
            };

            await Log.create(requestLogData);
        } catch (error) {
            console.error("Error logging request:", error.message);
        }
    }

    hasToken(req) {}

    isValidRoute(req) {}
}

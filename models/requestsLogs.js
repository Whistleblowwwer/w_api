import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Log = sequelize.define(
    "Log",
    {
        continent: DataTypes.STRING,
        continentCode: DataTypes.STRING,
        country: DataTypes.STRING,
        countryCode: DataTypes.STRING,
        city: DataTypes.STRING,
        zip: DataTypes.STRING,
        lat: DataTypes.FLOAT,
        lon: DataTypes.FLOAT,
        timezone: DataTypes.STRING,
        offset: DataTypes.INTEGER,
        requestMethod: DataTypes.STRING,
        queryRoute: DataTypes.STRING,
        _ip_address: DataTypes.STRING,
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
    },
    {
        tableName: "requestsLogs",
        timestamps: true,
    }
);

export default Log;

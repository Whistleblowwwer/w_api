import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const BusinessFollowers = sequelize.define(
    "BusinessFollowers",
    {
        _id_business_followers: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
    },
    {
        tableName: "businessFollowers",
        timestamps: true,
    }
);
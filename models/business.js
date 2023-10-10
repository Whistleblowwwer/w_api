import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Business = sequelize.define(
    "Business",
    {
        _id_business: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "businesses",
        timestamps: true, 
    }
);



import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Review = sequelize_write.define(
    "Review",
    {
        _id_review: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        rating: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
                max: 5,
            },
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "reviews",
        timestamps: true,
    }
);

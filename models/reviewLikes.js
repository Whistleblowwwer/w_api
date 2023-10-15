import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ReviewLikes = sequelize.define(
    "ReviewLikes",
    {
        _id_review_likes: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
    },
    {
        tableName: "reviewLikes",
        timestamps: true,
    }
);


import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./users.js"
import { Review } from "./reviews.js"

export const ReviewLikes = sequelize.define(
    "ReviewLikes",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: User,
                key: "_id_user",
            },
        },
        _id_review: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: Review,
                key: "_id_review",
            },
        },
    },
    {
        tableName: "reviewLikes",
        timestamps: true,
    }
);
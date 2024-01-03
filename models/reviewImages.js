import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const ReviewImages = sequelize_write.define(
    "ReviewImages",
    {
        _id_review_image: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        image_url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        _id_review: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "reviews",
                key: "_id_review",
            },
        },
    },
    {
        tableName: "reviewImages",
        timestamps: true,
    }
);

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ReviewImages = sequelize.define(
    "ReviewImages",
    {
        _id_review_image: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        tableName: "review_images",
        timestamps: true,
    }
);

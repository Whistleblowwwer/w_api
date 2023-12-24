import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CommentImages = sequelize.define(
    "CommentImages",
    {
        _id_comment_image: {
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
        _id_comment: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "comments",
                key: "_id_comment",
            },
        },
    },
    {
        tableName: "commentImages",
        timestamps: true,
    }
);

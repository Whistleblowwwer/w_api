import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const CommentImages = sequelize_write.define(
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

import { sequelize_write } from "../config/db_write.js";
import { DataTypes } from "sequelize";

export const Notification = sequelize_write.define(
    "Notification",
    {
        _id_notification: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        _id_user_sender: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "_id_user",
            },
        },
        _id_user_receiver: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "_id_user",
            },
        },
        _id_target: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM(
                "chat",
                "review",
                "comment",
                "profile",
                "news",
                "business",
                "alert",
                "advertisement"
            ),
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "notifications",
        timestamps: true,
    }
);

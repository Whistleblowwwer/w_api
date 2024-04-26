import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const UserTopicSubscription = sequelize_write.define(
    "UserTopicSubscription",
    {
        _id_user_topic_subscription: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        _id_user: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "_id_user",
            },
        },
        _id_topic: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "topics",
                key: "_id_topic",
            },
        },
    },
    {
        tableName: "userTopicSubscriptions",
        timestamps: true, // Assuming you want createdAt and updatedAt for tracking
    }
);

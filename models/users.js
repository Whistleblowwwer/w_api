import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const User = sequelize_write.define(
    "User",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM("M", "F", "O"),
            allowNull: false,
        },
        password_token: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        profile_picture_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM("consumer", "admin"),
            allowNull: false,
            defaultValue: "consumer",
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        nick_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        blockedBy: {
            type: DataTypes.ARRAY(DataTypes.UUID), // Array of user IDs who blocked this user
            allowNull: true,
            defaultValue: [],
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

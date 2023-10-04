import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define(
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
            unique: true,
        },
        phone_number: {  
            type: DataTypes.STRING(20),
            allowNull: true,
            unique: true,
        },
        birth_date: {  
            type: DataTypes.DATE,
            allowNull: true,
        },
        gender: {  
            type: DataTypes.ENUM('M', 'F', 'O'),
            allowNull: true,
        },
        password_token: {  
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        profile_picture: {
            type: DataTypes.STRING(255),
        },
        role: {
            type: DataTypes.ENUM("consumer", "admin"),
            allowNull: false,
            defaultValue: "consumer"
        },        
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

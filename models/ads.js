import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Ad = sequelize_write.define(
    "Ad",
    {
        _id_ad: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_campaign_date: {
            type: DataTypes.DATE,
        },
        end_campaign_date: {
            type: DataTypes.DATE,
        },
        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        clickUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("active", "paused", "expired"),
            allowNull: false,
            defaultValue: "active",
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        _id_user: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "_id_user",
            },
        },
        type: {
            type: DataTypes.ENUM("Banner", "Review"),
            allowNull: false,
            defaultValue: "Banner",
        },
    },
    {
        tableName: "ads",
        timestamps: true,
    }
);

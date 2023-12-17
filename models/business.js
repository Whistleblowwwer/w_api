import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Business = sequelize.define(
    "Business",
    {
        _id_business: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        entity: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        profile_picture_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "Mexico",
        },
        _id_category: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "categories",
                key: "_id_category",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "businesses",
        timestamps: true,
    }
);

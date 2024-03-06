// models/business.js
import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Business = sequelize_write.define(
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
        iso2_country_code: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        iso2_state_code: {
            type: DataTypes.STRING(4),
            allowNull: true,
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

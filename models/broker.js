import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Broker = sequelize_write.define(
    "Broker",
    {
        _id_broker: {
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
        INE: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        phone_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM("attorney", "assistant"),
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        img_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "brokers",
        timestamps: true,
    }
);

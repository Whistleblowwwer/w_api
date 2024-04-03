import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Message = sequelize_write.define(
    "Message",
    {
        _id_message: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_valid_sender: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        is_valid_receiver: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        tableName: "messages",
        timestamps: true,
    }
);


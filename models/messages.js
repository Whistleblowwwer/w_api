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
    },
    {
        tableName: "messages",
        timestamps: true,
    }
);

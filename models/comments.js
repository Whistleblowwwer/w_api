import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Comment = sequelize_write.define(
    "Comment",
    {
        _id_comment: {
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
        tableName: "comments",
        timestamps: true,
    }
);

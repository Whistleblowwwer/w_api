import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Topic = sequelize_write.define(
    "Topic",
    {
        _id_topic: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        // You can add more fields as needed here
    },
    {
        tableName: "topics",
        timestamps: true, // Assuming you want to track when topics are created/updated
    }
);

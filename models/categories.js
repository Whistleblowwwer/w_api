import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Category = sequelize.define(
    "Category",
    {
        _id_category: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        parent_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "categories",
                key: "_id_category",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "categories",
        timestamps: true,
    }
);

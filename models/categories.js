import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Category = sequelize_write.define(
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
        _id_parent: {
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

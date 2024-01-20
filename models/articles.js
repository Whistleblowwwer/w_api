import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Article = sequelize_write.define(
    "Article",
    {
        _id_article: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        subtitle: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        published_at: {
            type: DataTypes.DATE,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        _id_category: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "categories", // Replace with the actual table name of your Category model
                key: "_id_category",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "articles",
        timestamps: true,
    }
);

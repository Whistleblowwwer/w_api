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
    },
    {
        tableName: "articles",
        timestamps: true,
    }
);

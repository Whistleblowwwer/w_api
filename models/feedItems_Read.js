import { DataTypes } from "sequelize";
import { sequelize } from "../config/db_read.js";

export const FeedItems = sequelize.define(
    "FeedItems",
    {
        _id_feed_item: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        _id_user: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        _id_target: {
            type: DataTypes.UUID,
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        interaction: {
            type: DataTypes.ENUM(
                'Like Review',
                'Like Comment',
                'Comment Review',
                'Comment Comment',
                'Create Review',
                'Follow Business',
                'Create Business'
            ),
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "FeedItems",
        timestamps: false,
    }
);
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db_write.js";

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
            references: {
                model: 'users', 
                key: '_id_user'
            }
        },
        list_id_target: {
            type: DataTypes.ARRAY(DataTypes.UUID),
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
        tableName: "feedItems",
        timestamps: false,
    }
);
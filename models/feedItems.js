import { DataTypes } from "sequelize";
// import { sequelize_read } from "../config/db_read.js";
import { sequelize_write } from "../config/db_write.js";

// export const FeedItems_Read = sequelize_read.define(
//     "FeedItems",
//     {
//         _id_feed_item: {
//             type: DataTypes.UUID,
//             defaultValue: DataTypes.UUIDV4,
//             primaryKey: true,
//             allowNull: false,
//         },
//         _id_user: {
//             type: DataTypes.UUID,
//             allowNull: false,
//             references: {
//                 model: "users",
//                 key: "_id_user",
//             },
//         },
//         _id_target: {
//             type: DataTypes.UUID,
//             references: {
//                 model: "users",
//                 key: "_id_user",
//             },
//         },
//         score: {
//             type: DataTypes.FLOAT,
//             allowNull: false,
//         },
//         interaction: {
//             type: DataTypes.ENUM(
//                 'Like Review',
//                 'Like Comment',
//                 'Comment Review',
//                 'Comment Comment',
//                 'Create Review',
//                 'Follow Business',
//                 'Create Business'
//             ),
//             allowNull: false,
//         },
//         is_valid: {
//             type: DataTypes.BOOLEAN,
//             allowNull: false,
//         },
//     },
//     {
//         tableName: "FeedItems",
//         timestamps: false,
//     }
// );

export const FeedItems_Write = sequelize_write.define(
    "FeedItems",
    {
        _id_feed_item: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
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
                "Like Review",
                "Like Comment",
                "Comment Review",
                "Comment Comment",
                "Create Review",
                "Follow Business",
                "Create Business"
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

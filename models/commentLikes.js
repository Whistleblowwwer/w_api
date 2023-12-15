import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./users.js"; 
import { Comment } from "./comments.js"; 

export const CommentLikes = sequelize.define(
    "CommentLikes",
    {
        _id_user: {
            type: DataTypes.UUID,
            references: {
                Model: User, 
                key: '_id_user',
            },
        },
        _id_comment: {
            type: DataTypes.UUID,
            references: {
                Model: Comment, 
                key: '_id_comment',
            },
        },
    },
    {
        tableName: "commentLikes",
        timestamps: true,
    }
);


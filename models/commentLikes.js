import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const CommentLikes = sequelize.define('CommentLikes', {
    _id_comment_likes: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    }
}, {
    tableName: 'commentLikes',
    timestamps: true,
});
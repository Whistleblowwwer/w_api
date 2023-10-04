import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const UserFollowers = sequelize.define('UserFollowers', {
    _id_user_followers: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    }
}, {
    tableName: 'userFollowers',
    timestamps: true,
});

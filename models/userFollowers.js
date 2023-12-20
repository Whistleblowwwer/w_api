import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./users.js";

export const UserFollowers = sequelize.define(
    "UserFollowers",
    {
        _id_follower: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: '_id_user'
            }
        },
        _id_followed: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: '_id_user'
            }
        }
    },
    {
        tableName: "userFollowers",
        timestamps: true,
    }
);

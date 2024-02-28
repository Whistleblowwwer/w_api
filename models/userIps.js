import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";
import { User } from "./users.js";

export const UserIps = sequelize_write.define(
    "UserIps",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: User,
                key: "_id_user",
            },
        },
        _ip_address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: DataTypes.STRING,
        country: DataTypes.STRING,
    },
    {
        tableName: "userIps",
        timestamps: true,
    }
);

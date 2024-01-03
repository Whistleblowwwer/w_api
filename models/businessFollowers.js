import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";
import { User } from "./users.js";
import { Business } from "./business.js";

export const BusinessFollowers = sequelize_write.define(
    "BusinessFollowers",
    {
        _id_user: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                Model: User,
                key: "_id_user",
            },
        },
        _id_business: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                Model: Business,
                key: "_id_business",
            },
        },
    },
    {
        tableName: "businessFollowers",
        timestamps: true,
    }
);

import { DataTypes } from "sequelize";
import { sequelize_write } from "../config/db_write.js";

export const Banner = sequelize_write.define(
    "Banner",
    {
        _id_banner: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        location: {
            type: DataTypes.ENUM("FY", "BS", "TD", "NW"),
            allowNull: false,
        },
        index_position: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_valid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "banners",
        timestamps: true,
    }
);

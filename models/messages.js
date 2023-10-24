import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Message = sequelize.define(
    'Message', 
    {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
            notEmpty: { msg: 'El mensaje no puede estar vacío' }
            }
        }
    }, 
    {
        timestamps: true,
        tableName: 'messages'
    }
);


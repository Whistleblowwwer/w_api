import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME_READ,
    process.env.DB_USER_READ,
    process.env.DB_PASSWORD_READ,
    {
        host: process.env.DB_HOST_READ,
        dialect: "postgres",
        port: process.env.DB_PORT_READ,
    }
);

import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME_WRITE,
    process.env.DB_USER_WRITE,
    process.env.DB_PASSWORD_WRITE,
    {
        host: process.env.DB_HOST_WRITE,
        dialect: "postgres",
        port: process.env.DB_PORT_WRITE,
    }
);

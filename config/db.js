import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();
console.log(
    process.env.DB, // db name,
    process.env.DB_USER, // username
    process.env.DB_PASSWORD
);
export const sequelize = new Sequelize(
    process.env.DB, // db name,
    process.env.DB_USER, // username
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
    }
);

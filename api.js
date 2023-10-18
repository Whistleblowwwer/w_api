import { sequelize } from "./config/db.js";
import express from "express";
import morgan from "morgan";
import cors from "cors"; // Import the cors package
import "./models/associations.js";
import router from "./routes/routes.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Use cors middleware with desired options
app.use(
    cors({
        origin: "*",
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(router);

async function main() {
    await sequelize.sync({ force: false });
    app.listen(4000);
    console.log("Server on port", 4000);
}
main();

export default app;

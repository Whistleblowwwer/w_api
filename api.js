import { sequelize } from "./config/db.js";
import express from "express";
import morgan from "morgan";
import router from "./routes/routes.js";

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Aqui estan todas las rutas
app.use(router);
// Excepto la de tu corazón

async function main() {
    await sequelize.sync({ force: false });
    app.listen(4000);
    console.log("Server on port", 4000);
}

main();

export default app;

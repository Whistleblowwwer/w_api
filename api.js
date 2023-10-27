import { sequelize } from "./config/db.js";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import cors from "cors";
import "./models/associations.js";
import router from "./routes/routes.js";
import { initializeWebSocketServer } from "./socket.js";

const app = express();
const httpServer = createServer(app); //Express app runs on http server

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(router);

//Initialize Socket.io configuration, also runs on http server
const io = initializeWebSocketServer(httpServer);

async function main() {
    await sequelize.sync({ force: false });
    const PORT = process.env.PORT;
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
main();

export default app;

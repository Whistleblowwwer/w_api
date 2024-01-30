import { initializeWebSocketServer } from "./socket.js";
import { sequelize_write } from "./config/db_write.js";
import { UpdateCache } from "./middlewares/cache.js";
import { initializeApp } from "firebase-admin/app";
import router from "./routes/routes.js";
import { createServer } from "http";
import "./models/associations.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const fireBase = initializeApp();
// const creds = AWS.SharedIniFileCredentials({ profile: "default" });
// const sns = new AWS.SNS({ creds, region: "us-east-2" });

// Middlewares
app.set("trust proxy", true);
app.use(morgan("dev"));
app.use(express.json());
app.use(
    cors({
        origin: "*",
        methods: "GET, POST, PUT, DELETE, PATCH",
        allowedHeaders: "Content-Type, Authorization",
    })
);

// Gateway
app.use(router);

//Initialize Socket.io configuration
const io = initializeWebSocketServer(httpServer);

async function main() {
    await sequelize_write.sync({ force: false });
    console.log("Connected to Write DB");

    await UpdateCache();

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
main();

export default app;

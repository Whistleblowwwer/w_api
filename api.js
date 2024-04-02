import serviceAccount from "./config/whistleblowwer-notificaciones-firebase-adminsdk-pwr18-e3015a8fed.json" assert { type: "json" };
import { initializeWebSocketServer } from "./socket.js";
import { sequelize_write } from "./config/db_write.js";
import { UpdateCache } from "./utils/cache.js";
import router from "./routes/routes.js";
import { createServer } from "http";
import "./models/associations.js";
import admin from "firebase-admin";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { Message } from "./models/messages.js";

const app = express();
const httpServer = createServer(app);

// FCM
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

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

//Online Users Set
export const onlineUsers = new Set();

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

    await Message.update({ is_read: true }, { where: { is_read: null } });

}
main();

export default app;

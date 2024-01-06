// import { sequelize_read } from "./config/db_read.js";
import { sequelize_write } from "./config/db_write.js";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import cors from "cors";
import "./models/associations.js";
import router from "./routes/routes.js";
import { initializeWebSocketServer } from "./socket.js";
import { UpdateCache } from "./middlewares/cache.js";
import { IpInfo } from "./middlewares/ipInfo.js";

const app = express();
const httpServer = createServer(app); //Express app runs on http server

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

app.use(IpInfo);
app.use(router);

//Initialize Socket.io configuration, also runs on http server
const io = initializeWebSocketServer(httpServer);

async function main() {
    // await sequelize.sync({ force: false });
    // console.log("Connected to DB");

    await sequelize_write.sync({ force: false });
    console.log("Connected to Write DB");

    // await sequelize_read.sync({ force: false });
    // console.log("Connected to Read DB");

    await UpdateCache();

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
main();

export default app;

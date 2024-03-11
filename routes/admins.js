import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    subscribeAllUsersToTopic,
    unsubscribeAllUsersFromTopic,
    listTopics,
    deleteTopic,
    sendNotificationToTopic,
} from "../controllers/admins.js"; // Adjust imports as necessary

const router = Router();

//----------Admin Routes-------------

// Assuming validateUser middleware also validates the role
// Topic CRUD and Notifications
router.get("/topics", validateUser, listTopics);
router.delete("/topics/:_id_topic", validateUser, deleteTopic);
router.post("/topics/notify", validateUser, sendNotificationToTopic);

// Subscription Management
router.post("/subscribe-all-to-topic", validateUser, subscribeAllUsersToTopic);
router.post(
    "/unsubscribe-all-from-topic",
    validateUser,
    unsubscribeAllUsersFromTopic
);

export default router;

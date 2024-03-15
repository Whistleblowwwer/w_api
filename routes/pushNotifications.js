import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    subscribeUsersToTopic,
    unsubscribeAllUsersFromTopic,
    listTopics,
    deleteTopic,
    sendNotificationToTopic,
} from "../controllers/pushNotifications.js"; // Adjust imports as necessary
import {
    subscribeFollowersToBusinessTopics,
    unsubscribeAllUsersFromAllTopics,
} from "../test/businessTopics.js";

const router = Router();

//----------Admin Routes-------------

// Assuming validateUser middleware also validates the role
// Topic CRUD and Notifications
router.get("/topics", validateUser, listTopics);
router.delete("/topics/:_id_topic", validateUser, deleteTopic);
router.post("/topics/notify", validateUser, sendNotificationToTopic);
router.post("/topics/test", validateUser, subscribeFollowersToBusinessTopics);
router.post(
    "/topics/unsubscribetest",
    validateUser,
    unsubscribeAllUsersFromAllTopics
);

// Subscription Management
router.post("/subscribe-all-to-topic", validateUser, subscribeUsersToTopic);
router.post(
    "/unsubscribe-all-from-topic",
    validateUser,
    unsubscribeAllUsersFromTopic
);

export default router;

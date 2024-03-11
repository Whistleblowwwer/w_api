import { UserTopicSubscription } from "../models/userTopicSubscriptions.js";
import { Topic } from "../models/topics.js";
import { User } from "../models/users.js";
import { Sequelize } from "sequelize";
import admin from "firebase-admin";

// Subscribe list of users or all users to a topic
export const subscribeAllUsersToTopic = async (req, res) => {
    const _id_user = req.user._id_user;
    const user = await User.findByPk(_id_user);
    const { topicName, userIds } = req.body;

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Permission denied. Only admins can perform this action.",
        });
    }

    if (!topicName) {
        return res.status(400).json({ message: "Topic name is required." });
    }

    try {
        let [topic, created] = await Topic.findOrCreate({
            where: { name: topicName },
        });

        let whereCondition = { fcm_token: { [Sequelize.Op.ne]: null } };
        if (userIds && userIds.length > 0) {
            whereCondition._id_user = { [Sequelize.Op.in]: userIds };
        }

        const usersToSubscribe = await User.findAll({ where: whereCondition });
        const tokens = usersToSubscribe
            .map((user) => user.fcm_token)
            .filter((token) => token != null);

        if (tokens.length > 0) {
            const firebaseResponse = await admin
                .messaging()
                .subscribeToTopic(tokens, topicName)
                .then((response) => {
                    console.log(
                        "Successfully subscribed to Firebase topic:",
                        response
                    );
                    return response; // Proceed with the database operation
                })
                .catch((error) => {
                    console.error(
                        "Error subscribing to Firebase topic:",
                        error
                    );
                    throw error; // Stop the operation and throw the error
                });

            const subscriptionPromises = usersToSubscribe.map((user) =>
                UserTopicSubscription.findOrCreate({
                    where: {
                        _id_user: user._id_user,
                        _id_topic: topic._id_topic,
                    },
                })
            );

            await Promise.all(subscriptionPromises);

            res.json({
                message: `Subscription completed with ${firebaseResponse.successCount} successes and ${firebaseResponse.failureCount} failures.`,
                successCount: firebaseResponse.successCount,
                failureCount: firebaseResponse.failureCount,
                failures: firebaseResponse.errors,
            });
        } else {
            res.status(404).json({
                message: "No users with FCM tokens found for subscription.",
            });
        }
    } catch (error) {
        console.error("Error subscribing users to topic:", error);
        res.status(500).send({ message: "Error subscribing users to topic." });
    }
};

// Assuming necessary imports from the previous snippet
export const unsubscribeAllUsersFromTopic = async (req, res) => {
    const _id_user = req.user._id_user;
    const user = await User.findByPk(_id_user);
    const { topicName, userIds } = req.body;

    if (user.role !== "admin") {
        return res.status(403).json({
            message: "Permission denied. Only admins can perform this action.",
        });
    }

    if (!topicName) {
        return res.status(400).json({ message: "Topic name is required." });
    }

    try {
        const topic = await Topic.findOne({ where: { name: topicName } });
        if (!topic)
            return res.status(404).json({ message: "Topic not found." });

        let whereCondition = { _id_topic: topic._id_topic };
        if (userIds) {
            whereCondition._id_user = { [Sequelize.Op.in]: userIds };
        }

        const usersToUnsubscribe = await User.findAll({
            where: whereCondition,
            attributes: ["fcm_token"],
        });
        const tokens = usersToUnsubscribe
            .map((user) => user.fcm_token)
            .filter((token) => token != null);

        if (tokens.length > 0) {
            const firebaseResponse = await admin
                .messaging()
                .unsubscribeFromTopic(tokens, topicName)
                .then((response) => {
                    console.log(
                        "Successfully unsubscribed from Firebase topic:",
                        response
                    );
                    return response; // Continue after successful Firebase operation
                })
                .catch((error) => {
                    console.error(
                        "Error unsubscribing from Firebase topic:",
                        error
                    );
                    throw error; // Stop the operation and throw the error
                });

            await UserTopicSubscription.destroy({ where: whereCondition });

            res.json({
                message: `Unsubscription completed with ${firebaseResponse.successCount} successes and ${firebaseResponse.failureCount} failures.`,
                successCount: firebaseResponse.successCount,
                failureCount: firebaseResponse.failureCount,
                failures: firebaseResponse.errors,
            });
        } else {
            res.status(404).json({
                message: "No users with FCM tokens found for unsubscription.",
            });
        }
    } catch (error) {
        console.error("Error unsubscribing users from topic:", error);
        res.status(500).send({
            message: "Error unsubscribing users from topic.",
        });
    }
};

// List topics and subscribed users
export const listTopics = async (req, res) => {
    try {
        const topics = await Topic.findAll({
            include: [
                {
                    model: User,
                    as: "Subscribers", // Adjust based on your association alias
                    through: { attributes: [] }, // Do not include junction table fields
                    attributes: ["_id_user", "name"], // Adjust to reflect actual user attributes
                },
            ],
        });
        const topicsWithCount = topics.map((topic) => ({
            ...topic.toJSON(),
            subscriberCount: topic.Subscribers.length,
        }));
        res.json(topicsWithCount);
    } catch (error) {
        console.error("Error listing topics:", error);
        res.status(500).send({ message: "Error listing topics." });
    }
};

// Hard deletes a topic
export const deleteTopic = async (req, res) => {
    const { _id_topic } = req.params;
    try {
        const numDestroyed = await Topic.destroy({
            where: { _id_topic },
        });
        if (numDestroyed) {
            res.json({ message: "Topic deleted successfully." });
        } else {
            res.status(404).json({ message: "Topic not found." });
        }
    } catch (error) {
        console.error("Error deleting topic:", error);
        res.status(500).send({ message: "Error deleting topic." });
    }
};

// Sends push notification for a topic
export const sendNotificationToTopic = async (req, res) => {
    const { topicName, title, body } = req.body;
    const message = {
        notification: { title, body },
        topic: topicName,
    };

    try {
        const response = await admin.messaging().send(message);
        res.json({ message: "Notification sent successfully.", response });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).send({ message: "Error sending notification." });
    }
};

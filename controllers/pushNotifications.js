import { UserTopicSubscription } from "../models/userTopicSubscriptions.js";
import { BusinessFollowers } from "../models/businessFollowers.js";
import { UserFollowers } from "../models/userFollowers.js";
import { Notification } from "../models/notifications.js";
import { Business } from "../models/business.js";
import { Review } from "../models/reviews.js";
import { Topic } from "../models/topics.js";
import { User } from "../models/users.js";
import { Sequelize } from "sequelize";
import admin from "firebase-admin";

export const subscribeFCM = async (req, res) => {
    try {
        const _id_user = req.user._id_user;
        const { FCM, topic } = req.body;

        // Find the user by primary key (_id_user)
        const user = await User.findByPk(_id_user);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the FCM token in the user model
        user.fcm_token = FCM;

        // Save the changes to the database
        await user.save();

        return res.status(201).json({
            message: "FCM saved successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
    const _id_notification = req.params._id_notification;

    try {
        const notification = await Notification.findByPk(_id_notification);
        if (!notification) {
            return res.status(404).send({ message: "Notification not found" });
        }

        await notification.destroy();
        res.status(200).send({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Get All Notifications for a User
export const getAllNotificationsForUser = async (req, res) => {
    const _id_user_receiver = req.user._id_user;

    try {
        const notifications = await Notification.findAll({
            where: { _id_user_receiver, is_valid: true },
            // Consider including related models if needed for other notification types
        });

        if (notifications.length === 0) {
            return res
                .status(404)
                .send({ message: "No notifications found for this user" });
        }

        const formattedNotifications = [];
        for (const notification of notifications) {
            const { _id_target, type, ...notificationData } =
                notification.toJSON();
            let targetInfo = { id: _id_target };

            // Fetch sender information common to all notification types
            const sender = await User.findByPk(notification._id_user_sender);
            if (sender) {
                targetInfo.name = sender.name;
                targetInfo.last_name = sender.last_name;
                targetInfo.nick_name = sender.nick_name;
            }

            // Special handling for different types of notifications
            if (["chat", "review", "comment", "profile"].includes(type)) {
                // Additional specific logic for these types, if any
                targetInfo.is_followed = (await UserFollowers.findOne({
                    where: {
                        _id_follower: _id_user_receiver,
                        _id_followed: notification._id_user_sender,
                    },
                }))
                    ? true
                    : false;
            } else if (type === "business") {
                // Fetch review to get business information along with the sender's details
                const review = await Review.findByPk(_id_target, {
                    include: [
                        {
                            model: Business,
                            attributes: ["_id_business", "name", "entity"],
                        },
                    ],
                });

                if (review && review.Business) {
                    targetInfo.Business = {
                        name: review.Business.name,
                        entity: review.Business.entity,
                    };

                    // Check if the receiver follows the business
                    targetInfo.is_followed = (await BusinessFollowers.findOne({
                        where: {
                            _id_user: _id_user_receiver,
                            _id_business: review._id_business,
                        },
                    }))
                        ? true
                        : false;
                }
            }

            formattedNotifications.push({
                ...notificationData,
                type,
                Target: targetInfo,
            });
        }

        res.status(200).send({
            message: "Notifications found",
            notifications: formattedNotifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send({ error: error.message });
    }
};

// Delete All Notifications for a User
export const deleteAllNotificationsForUser = async (req, res) => {
    const _id_user_receiver = req.params._id_user_receiver;

    try {
        const deletedCount = await Notification.destroy({
            where: { _id_user_receiver },
        });

        if (deletedCount === 0) {
            return res
                .status(404)
                .send({ message: "No notifications found for this user" });
        }

        res.status(200).send({
            message: `Deleted ${deletedCount} notifications for the user`,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

// Subscribe list of users or all users to a topic
export const subscribeUsersToTopic = async (req, res) => {
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

// Subscribe list of users or all users to a topic
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

        let whereCondition = {};
        if (userIds) {
            whereCondition = { _id_user: { [Sequelize.Op.in]: userIds } };
        }

        // Delete entries from the join table
        const deletionResult = await UserTopicSubscription.destroy({
            where: {
                ...whereCondition,
                _id_topic: topic._id_topic,
            },
        });

        if (deletionResult > 0) {
            // Unsubscribe devices from the topic
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
                        return response;
                    })
                    .catch((error) => {
                        console.error(
                            "Error unsubscribing from Firebase topic:",
                            error
                        );
                        throw error;
                    });

                res.json({
                    message: `Unsubscription completed with ${firebaseResponse.successCount} successes and ${firebaseResponse.failureCount} failures.`,
                    successCount: firebaseResponse.successCount,
                    failureCount: firebaseResponse.failureCount,
                    failures: firebaseResponse.errors,
                });
            } else {
                res.status(404).json({
                    message:
                        "No users with FCM tokens found for unsubscription.",
                });
            }
        } else {
            // No users found for unsubscription
            res.status(404).json({
                message: "No users found for unsubscription.",
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
    const { topicName, title, content } = req.body;

    try {
        // Check if the specified topic exists
        const topicExists = await Topic.findOne({
            where: { name: topicName },
        });

        console.log("\n-- TOPIC EXISTS: ", topicExists.name);

        if (!topicExists) {
            return res.status(404).json({ message: "Topic not found." });
        }

        // Construct the message
        const message = {
            notification: { title, body: content },
            topic: topicName,
        };

        // Send the notification
        const response = await admin.messaging().send(message);

        return res.json({
            message: "Notification sent successfully.",
            response,
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ message: "Error sending notification." });
    }
};

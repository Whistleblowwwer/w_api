import { UserTopicSubscription } from "../models/userTopicSubscriptions.js";
import { Business } from "../models/business.js";
import { Topic } from "../models/topics.js";
import { User } from "../models/users.js";
import admin from "firebase-admin";
import { Op } from "sequelize";

export const subscribeFollowersToBusinessTopics = async () => {
    try {
        // Fetch all businesses
        const businesses = await Business.findAll({
            include: [
                {
                    model: User,
                    as: "businessFollowers",
                    where: {
                        fcm_token: { [Op.ne]: null },
                    },
                    attributes: ["_id_user", "fcm_token"],
                },
            ],
        });

        // Loop through each business
        for (const business of businesses) {
            // Filter out unwanted characters from business name and create topic name
            const filteredName = business.name.replace(/[^\w\s]/gi, ""); // Remove special characters
            const topicName = `${filteredName.replace(
                /\s+/g,
                ""
            )}_newReview_topic`;

            // Check if topic already exists
            let topic = await Topic.findOne({ where: { name: topicName } });
            if (!topic) {
                topic = await Topic.create({ name: topicName });
            }

            // Fetch followers of the business
            const followers = business.businessFollowers;

            // Subscribe followers to the topic and add subscription to database
            for (const follower of followers) {
                // Subscribe follower to topic using Firebase
                await admin
                    .messaging()
                    .subscribeToTopic(follower.fcm_token, topicName);

                // Add subscription to database
                await UserTopicSubscription.create({
                    _id_user: follower._id_user,
                    _id_topic: topic._id_topic,
                });
            }
        }

        console.log(
            "All followers subscribed to corresponding business topics successfully"
        );
    } catch (error) {
        console.error("Error subscribing followers to business topics:", error);
    }
};

export const unsubscribeAllUsersFromAllTopics = async () => {
    try {
        // Get all FCM tokens from users
        const users = await User.findAll({
            attributes: ["fcm_token"],
            where: {
                fcm_token: { [Op.ne]: null },
            },
        });

        const tokens = users.map((user) => user.fcm_token);

        // Get all topics names
        const topics = await Topic.findAll({
            attributes: ["name"],
        });

        const topicNames = topics.map((topic) => topic.name);

        // Filter out the topics based on the specified rule
        const filteredTopicNames = topicNames.filter((topicName) => {
            return /^[a-zA-Z0-9-_.~%]+$/.test(topicName);
        });

        // Unsubscribe users from topics using Firebase
        const unsubscribePromises = filteredTopicNames.map(
            async (topicName) => {
                try {
                    console.log("Unsubscribing users from topic:", topicName);
                    const firebaseResponse = await admin
                        .messaging()
                        .unsubscribeFromTopic(tokens, topicName);
                    console.log(
                        `Successfully unsubscribed users from topic: ${topicName}`
                    );
                    return firebaseResponse;
                } catch (error) {
                    console.error(
                        `Error unsubscribing users from topic ${topicName}:`,
                        error
                    );
                    throw error;
                }
            }
        );

        await Promise.all(unsubscribePromises);

        console.log("All users unsubscribed from all topics.");
    } catch (error) {
        console.error("Error unsubscribing users from topics:", error);
        throw error;
    }
};

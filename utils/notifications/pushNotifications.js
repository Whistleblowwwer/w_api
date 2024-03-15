import { UserTopicSubscription } from "../../models/userTopicSubscriptions.js";
import { BusinessFollowers } from "../../models/businessFollowers.js";
import { Notification } from "../../models/notifications.js";
import { Business } from "../../models/business.js";
import { Topic } from "../../models/topics.js";
import { User } from "../../models/users.js";
import admin from "firebase-admin";

// Function to create topic for business reviews when business is created
export const createBusinessTopic = async (businessName) => {
    try {
        // Validate business name existence
        if (!businessName) {
            throw new Error("Business name is required");
        }

        // Remove spaces from the business name
        const modifiedBusinessName = businessName.replace(/\s+/g, "");

        // Construct topic name with modified business name
        const topicName = `${modifiedBusinessName}_newReview_topic`;

        // Create the topic
        const topic = await Topic.create({ name: topicName });

        console.log("\n-- BUSINESS TOPIC CREATED:", topicName);
        return topic;
    } catch (error) {
        // Handle errors
        console.error("Error creating business topic:", error);
        throw error;
    }
};

// Function to subscribe a user to a business topic when user follows a business
export const subscribeUserToBusinessTopic = async (userId, businessId) => {
    try {
        const business = await Business.findByPk(businessId);

        // Validate business existence
        if (!business) {
            throw new Error("Business not found");
        }

        // Remove spaces from the business name
        const businessName = business.name.replace(/\s+/g, "");

        // Construct topic name with modified business name
        const topicName = `${businessName}_newReview_topic`;
        let topic = await Topic.findOne({ where: { name: topicName } });

        if (!topic) {
            // Create the topic if it doesn't exist
            console.log("\n-- CREATING BUSINESS TOPIC");
            topic = await Topic.create({ name: topicName });
        }

        // Subscribe user to the topic
        await UserTopicSubscription.create({
            _id_user: userId,
            _id_topic: topic._id_topic,
        });

        console.log("\n-- USER SUBSCRIBED TO NOTIFICATION TOPIC!");

        // Get the FCM token of the user to subscribe
        const user = await User.findByPk(userId);
        const token = user.fcm_token;

        if (token) {
            // Subscribe the user to the topic in Firebase
            const firebaseResponse = await admin
                .messaging()
                .subscribeToTopic(token, topicName);
            console.log(
                "Successfully subscribed to Firebase topic:",
                firebaseResponse
            );
        }

        // Return success message or data if needed
    } catch (error) {
        // Handle errors
        console.error("Error subscribing user to business topic:", error);
        throw error;
    }
};

// Function to unsubscribe a user from a business topic when a user unfollows a business
export const unsubscribeUserFromBusinessTopic = async (userId, businessId) => {
    try {
        const business = await Business.findByPk(businessId);

        // Remove spaces from the business name
        const sanitizedBusinessName = business.name.replace(/\s+/g, "");

        const topicName = `${sanitizedBusinessName}_newReview_topic`;
        const topic = await Topic.findOne({ where: { name: topicName } });

        if (topic) {
            // Unsubscribe user from the topic in the database
            await UserTopicSubscription.destroy({
                where: { _id_user: userId, _id_topic: topic._id_topic },
            });

            // Get the FCM token of the user
            const user = await User.findByPk(userId);
            const token = user.fcm_token;

            if (token) {
                // Unsubscribe the user from the topic in Firebase
                const firebaseResponse = await admin
                    .messaging()
                    .unsubscribeFromTopic(token, topicName);
                console.log(
                    "Successfully unsubscribed from Firebase topic:",
                    firebaseResponse
                );
            }
        }
    } catch (error) {
        // Handle errors
        console.error("Error unsubscribing user from business topic:", error);
        throw error;
    }
};

// Function to send push notifications for new reviews
export const sendNotificationToTopic = async (
    authorId,
    businessId,
    reviewId,
    reviewContent,
    nickName
) => {
    try {
        // Limit review content to 6 words
        const words = reviewContent.trim().split(/\s+/);
        const truncatedContent = words.slice(0, 6).join(" ");
        const body =
            words.length > 6 ? truncatedContent + " ..." : truncatedContent;

        const business = await Business.findByPk(businessId);

        // Remove spaces from the business name
        const sanitizedBusinessName = business.name.replace(/\s+/g, "");

        const topicName = `${sanitizedBusinessName}_newReview_topic`;
        const message = {
            notification: {
                title: `@${nickName} comentó en ${business.name}`, // Include nickName in the title
                body: body,
            },
            topic: topicName,
        };

        // Send notification to the topic in Firebase
        const response = await admin.messaging().send(message);
        console.log("Notification sent to topic:", response);

        // Log the notification in the Notification model
        const followers = await BusinessFollowers.findAll({
            where: { _id_business: businessId },
            attributes: ["_id_user"],
        });

        // Create a notification for each follower
        const notifications = followers.map((follower) => ({
            _id_user_sender: authorId,
            _id_user_receiver: follower._id_user,
            _id_target: reviewId,
            type: "comment",
            subject: `@${nickName} comentó en ${business.name}`,
            content: reviewContent,
            is_valid: true,
        }));

        // Bulk insert notifications into the database
        await Notification.bulkCreate(notifications);

        console.log("Notifications logged in the database successfully");
    } catch (error) {
        // Handle errors
        console.error("Error sending notification to topic:", error);
        throw error;
    }
};

export const mapFCM = async (FCM, _id_user) => {
    try {
        // Find the user by primary key (_id_user)
        const user = await User.findByPk(_id_user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.fcmtoken = FCM; // Assuming the column name is 'fcmtoken'. Adjust if needed.

        await user.save();

        return res.status(201).json({
            message: "FCM saved successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

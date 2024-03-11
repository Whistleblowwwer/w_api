import { User } from "../models/users.js";
import admin from "firebase-admin";

// Initialize Firebase Admin
// Make sure you have initialized Firebase Admin SDK elsewhere in your application,
// for example, by providing the service account key.
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // other options if needed
// });

function subscribeUsersToTopic(registrationTokens, topic) {
    admin
        .messaging()
        .subscribeToTopic(registrationTokens, topic)
        .then((response) => {
            console.log("Successfully subscribed to topic:", response);
        })
        .catch((error) => {
            console.error("Error subscribing to topic:", error);
        });
}

function sendGlobalAnnouncement(title, body) {
    const message = {
        notification: {
            title: title,
            body: body,
        },
        topic: "globalNotice",
    };

    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log("Successfully sent message:", response);
        })
        .catch((error) => {
            console.log("Error sending message:", error);
        });
}

// Function to get all FCM tokens and subscribe them to a topic
async function subscribeAllUsersToTopic() {
    try {
        const users = await User.findAll({
            attributes: ["fcm_token"], // Fetch all fcm_tokens
        });

        // Filter out null or undefined tokens manually
        const tokens = users
            .map((user) => user.fcm_token)
            .filter((token) => token);

        if (tokens.length > 0) {
            subscribeUsersToTopic(tokens, "globalNotice");
        } else {
            console.log("No tokens found for subscription.");
        }
    } catch (error) {
        console.error("Error fetching users for subscription:", error);
    }
}

// Run the function to subscribe all users to the 'globalNotice' topic
subscribeAllUsersToTopic();

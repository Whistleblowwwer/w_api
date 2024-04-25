import { User } from "../users.js";
import { Business } from "../business.js";
import { BusinessFollowers } from "../businessFollowers.js";
import { Notification } from "../notifications.js";
import admin from "firebase-admin";

export default class NotificationDTO {
    constructor({
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        type,
        title,
        content,
        is_followed,
        is_valid = true,
    } = {}) {
        this._id_user_sender = _id_user_sender ?? null;
        this._id_user_receiver = _id_user_receiver ?? null;
        this._id_target = _id_target ?? null;
        this.type = type ?? null;
        this.title = title ?? null;
        this.content = content ?? null;
        this.is_followed = is_followed ?? null;
        this.is_valid = is_valid;
    }

    async sendNotificationToTopic(message, topicName) {
        try {
            // Assuming `admin` has been initialized elsewhere in your application
            // with the Firebase Admin SDK
            const response = await admin.messaging().send({
                notification: {
                    title: message.notification.title,
                    body: message.notification.body,
                },
                data: {
                    _id_target: message.data._id_target,
                    target_type: message.data.target_type,
                },
                topic: topicName,
            });

            console.log("Notification sent to topic:", response);
            return response; // Optionally return the response for further processing or logging
        } catch (error) {
            console.error("Error sending notification to topic:", error);
            throw error; // Rethrow or handle the error appropriately
        }
    }

    // Function to send notification to receiver
    async sendNotificationToReceiver(message) {
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

    async logNotificationsForFollowers(
        _id_user_sender,
        _id_business,
        _id_review,
        senderNickname,
        businessName,
        reviewContent
    ) {
        // Find all followers of the business
        const followers = await BusinessFollowers.findAll({
            where: { _id_business },
            attributes: ["_id_user"],
        });

        // Construct notifications for each follower
        const notifications = followers.map((follower) => ({
            _id_user_sender,
            _id_user_receiver: follower._id_user,
            _id_target: _id_review,
            type: "business",
            subject: `@${senderNickname} commented on ${businessName}`,
            content: this.truncateContent(reviewContent, 6),
            is_valid: true,
        }));

        console.log("\n-- NOTIFICATIONS: ", notifications);
        // Bulk insert notifications into the database
        await Notification.bulkCreate(notifications);

        return notifications;
    }

    //CHAT
    async generateChatNotification(
        _id_user_sender,
        _id_user_receiver,
        content
    ) {
        // Generate message
        const message = await this.buildChatMessage(
            _id_user_sender,
            _id_user_receiver,
            content
        );

        // Check if the message is null (indicating that the notification should be skipped)
        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

        // Send to receiver
        this.sendNotificationToReceiver(message);

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target: _id_user_sender,
            type: "chat",
            subject: message.notification.title,
            content: message.notification.body,
            is_valid: true,
        });

        console.log("\n-- CHAT NOTIFICATION TO BE CREATED: ", notification);

        return notification;
    }

    async buildChatMessage(_id_user_sender, _id_user_receiver, content) {
        const userIds = [_id_user_sender, _id_user_receiver];

        const users = await User.findAll({
            where: {
                _id_user: userIds,
            },
        });

        const sender = users.find((user) => user._id_user === _id_user_sender);
        const receiver = users.find(
            (user) => user._id_user === _id_user_receiver
        );

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

        const message = {
            notification: {
                title: `[@${sender.nick_name}]: `,
                body: content,
            },
            data: {
                _id_target: _id_user_sender,
                target_type: "chat",
            },
            token: receiver.fcm_token,
        };

        return message;
    }

    // LIKE REVIEW
    async generateReviewLikeNotification(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        reviewContent
    ) {
        // Generate message
        const message = await this.buildReviewLikeMessage(
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            reviewContent
        );

        // Check if the message is null (indicating that the notification should be skipped)
        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

        this.sendNotificationToReceiver(message);

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            type: "review",
            subject: message.notification.title,
            content: message.notification.body,
            is_valid: true,
        });

        console.log(
            "\n-- LIKE REVIEW NOTIFICATION TO BE CREATED: ",
            notification
        );

        return notification;
    }

    async buildReviewLikeMessage(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        reviewContent
    ) {
        const userIds = [_id_user_sender, _id_user_receiver];

        const users = await User.findAll({
            where: {
                _id_user: userIds,
            },
        });

        const sender = users.find((user) => user._id_user === _id_user_sender);
        const receiver = users.find(
            (user) => user._id_user === _id_user_receiver
        );

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

        const message = {
            notification: {
                title: `@${sender.nick_name} le dio like tu reseña:`,
                body: reviewContent,
            },
            data: {
                _id_target,
                target_type: "review",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    // COMMENT
    async generateReviewCommentNotification(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        commentContent,
        parentReviewContent
    ) {
        //Generate Message
        const message = await this.buildReviewCommentMessage(
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            commentContent
        );

        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

        // Send to receiver
        this.sendNotificationToReceiver(message);

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            type: "comment",
            subject: parentReviewContent,
            content: commentContent,
            is_valid: true,
        });

        console.log("\n-- COMMENT NOTIFICATION TO BE CREATED: ", notification);

        return notification;
    }

    async buildReviewCommentMessage(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        commentContent
    ) {
        const userIds = [_id_user_sender, _id_user_receiver];

        const users = await User.findAll({
            where: {
                _id_user: userIds,
            },
        });

        const sender = users.find((user) => user._id_user === _id_user_sender);
        const receiver = users.find(
            (user) => user._id_user === _id_user_receiver
        );

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

        // push
        const message = {
            notification: {
                title: `@${sender.nick_name} comentó:`,
                body: commentContent,
            },
            data: {
                _id_target,
                target_type: "comment",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    //COMMENT LIKE
    async generateCommentLikeNotification(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        commentContent
    ) {
        //Generate Message
        const message = await this.buildCommentLikeMessage(
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            commentContent
        );

        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

        // Send to receiver
        this.sendNotificationToReceiver(message);

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target,
            type: "comment",
            subject: message.notification.title,
            content: message.notification.body,
            is_valid: true,
        });

        console.log(
            "\n-- COMMENT LIKE NOTIFICATION TO BE CREATED: ",
            notification
        );

        return notification;
    }

    async buildCommentLikeMessage(
        _id_user_sender,
        _id_user_receiver,
        _id_target,
        commentContent
    ) {
        const userIds = [_id_user_sender, _id_user_receiver];

        const users = await User.findAll({
            where: {
                _id_user: userIds,
            },
        });

        const sender = users.find((user) => user._id_user === _id_user_sender);
        const receiver = users.find(
            (user) => user._id_user === _id_user_receiver
        );

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

        const message = {
            notification: {
                title: `A ${sender.nick_name} le ha gustado tu comentario`,
                body: `${commentContent}`,
            },
            data: {
                _id_target,
                target_type: "comment",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    // NEW FOLLOWER
    async generateNewFollowerNotification(_id_user_sender, _id_user_receiver) {
        // Generate message
        const message = await this.buildNewFollowerMessage(
            _id_user_sender,
            _id_user_receiver
        );

        // Check if the message is null (indicating that the notification should be skipped)
        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

        // Send to receiver
        this.sendNotificationToReceiver(message);

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target: _id_user_sender,
            type: "profile",
            subject: message.notification.title,
            content: message.notification.body,
            is_valid: true,
        });

        console.log(
            "\n-- NEW FOLLOWER NOTIFICATION TO BE CREATED: ",
            notification
        );

        return notification;
    }

    // Builds the FCM message for a new follower
    async buildNewFollowerMessage(_id_user_sender, _id_user_receiver) {
        const userIds = [_id_user_sender, _id_user_receiver];

        const users = await User.findAll({
            where: {
                _id_user: userIds,
            },
        });

        const sender = users.find((user) => user._id_user === _id_user_sender);
        const receiver = users.find(
            (user) => user._id_user === _id_user_receiver
        );

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

        const message = {
            notification: {
                title: `¡Tienes un nuevo seguidor!`,
                body: `Saluda a ${sender.nick_name}`,
            },
            data: {
                _id_target: _id_user_sender,
                target_type: "profile",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    // NEW REVIEW FOR FOLLOWED BUSINESS
    async generateNewBusinessReviewNotification(
        _id_user_sender,
        _id_business,
        _id_review,
        reviewContent,
        senderNickname
    ) {
        // Get business information and construct the topic name
        const business = await Business.findByPk(_id_business);
        if (!business) {
            console.log("Business not found.");
            return null;
        }
        const sanitizedBusinessName = business.name.replace(/\s+/g, "");
        const topicName = `${sanitizedBusinessName}_newReview_topic`;

        // Construct the message with truncated content
        const truncatedContent = this.truncateContent(reviewContent, 6);

        const message = this.buildNewBusinessReviewMessage(
            senderNickname,
            business.name,
            truncatedContent,
            _id_review
        );

        // Send notification to the topic
        await this.sendNotificationToTopic(message, topicName);

        // Log a notification in the DB for each follower
        const notifications = await this.logNotificationsForFollowers(
            _id_user_sender,
            _id_business,
            _id_review,
            senderNickname,
            business.name,
            reviewContent
        );

        return notifications;
    }

    buildNewBusinessReviewMessage(
        senderNickname,
        businessName,
        content,
        _id_target
    ) {
        return {
            notification: {
                title: `@${senderNickname} comentó en ${businessName}`,
                body: content,
            },
            data: {
                _id_target: _id_target,
                target_type: "review",
            },
        };
    }

    truncateContent(content, wordLimit) {
        const words = content.split(/\s+/);
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + " ...";
        }
        return content;
    }
}

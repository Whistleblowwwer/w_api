import { User } from "../users.js";
import { Business } from "../business.js";
import { Notification } from "../notifications.js";
import admin from "firebase-admin";

export default class NotificationDTO {
    constructor({
        _id_user_sender = null,
        _id_user_receiver = null,
        _id_target = null,
        type = null,
        title = null,
        content = null,
        is_followed = null,
        is_valid = true,
    } = {}) {
        console.log("\n -- Entramos en dto");
        this._id_user_sender = _id_user_sender ?? null;
        this._id_user_receiver = _id_user_receiver ?? null;
        this._id_target = _id_target ?? null;
        this.type = type ?? null;
        this.title = title ?? null;
        this.content = content ?? null;
        this.is_followed = is_followed ?? null;
        this.is_valid = is_valid;
    }

    async generateChatNotification(_id_user_sender, _id_user_receiver, messageContent) {
        // Builds message
        const message = await this.buildChatMessage(_id_user_sender, messageContent);

        // Sends notification

        // Saves notification in db
        return this.generateNotification(
            _id_user_sender,
            "chat",
            _id_user_receiver,
            message
        );
    }

    async buildChatMessage(_id_user_sender, messageContent) {
        const sender = await User.findByPk(_id_user_sender);

        const message = {
            notification: {
                title: `Nuevo mensaje de ${sender.nick_name}`,
                body: messageContent, 
            },
            token: sender.fcm_token,
        };

        return message;
    }


    async generateReviewNotification(_id_user_sender, _id_user_receiver) {
        const message = await this.buildReviewMessage(_id_user_sender);
        return this.generateNotification(
            _id_user_sender,
            "review",
            _id_user_receiver,
            message
        );
    }

    async generateCommentNotification(_id_user_sender, _id_user_receiver) {
        const message = await this.buildCommentMessage(_id_user_sender);
        return this.generateNotification(
            _id_user_sender,
            "comment",
            _id_user_receiver,
            message
        );
    }

    // Handles notification construction and sends it
    async generateNewFollowerNotification(_id_user_sender, _id_user_receiver) {
        console.log("\n -- Entramos en generate");
        // Generate message
        const message = await this.buildNewFollowerMessage(
            _id_user_sender,
            _id_user_receiver
        );

        // Send to receiver

        admin
            .messaging()
            .send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log("Successfully sent message:", response);
            })
            .catch((error) => {
                console.log("Error sending message:", error);
            });

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

        const message = {
            notification: {
                title: `¡Tienes una nuevo seguidor!`,
                body: `Saluda a ${sender.nick_name}`,
            },
            data: {
                _id_target: _id_user_sender,
                target_type: "user",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    async generateNewsNotification(_id_user_sender, _id_user_receiver) {
        const message = await this.buildNewsMessage();
        return this.generateNotification(
            _id_user_sender,
            "news",
            _id_user_receiver,
            message
        );
    }

    async generateBusinessNotification(_id_user_sender, _id_user_receiver) {
        const message = await this.buildBusinessMessage();
        return this.generateNotification(
            _id_user_sender,
            "business",
            _id_user_receiver,
            message
        );
    }

    async buildReviewMessage(_id_user_sender) {
        const sender = await User.findByPk(_id_user_sender);
        return `${sender.nick_name} le dio me gusta a una de tus reseñas.`;
    }

    async buildCommentMessage(_id_user_sender) {
        const sender = await User.findByPk(_id_user_sender);
        return `${sender.nick_name} ha dejado un comentario en una de tus reseñas.`;
    }

    async buildNewsMessage() {
        return "Check out this new article";
    }

    async buildBusinessMessage() {
        const business = await Business.findOne(); // Add your business fetching logic
        return `A business you follow, ${business.name}, has new reviews`;
    }

    async generateNotification(
        _id_user_sender,
        type,
        _id_user_receiver,
        content
    ) {
        // Save the notification in the database
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            type,
            title: "Notification Title",
            content,
            is_valid: true,
            updatedAt: new Date(),
        });

        // Fetch receiver's FCM token
        const receiver = await User.findByPk(_id_user_receiver);
        const receiverFcmToken = receiver?.fcm_token;

        // Send notification using FCM token
        if (receiverFcmToken) {
            console.log(
                `Sending notification to ${receiver.nick_name} with FCM token: ${receiverFcmToken}`
            );
        }

        return notification;
    }
}

// Send a message to the device corresponding to the provided registration token.

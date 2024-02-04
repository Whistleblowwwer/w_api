import { User } from "../users.js";
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
        admin
            .messaging()
            .send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log("Successfully sent message:", response);
            })
            .catch((error) => {
                console.log("Error sending message:", error);
                // TODO: agregar log de error
            });

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
                title: `Nuevo mensaje de ${sender.nick_name}`,
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

    async generateReviewLikeNotification(
        _id_user_sender,
        _id_user_receiver,
        _id_target
    ) {
        // Generate message
        const message = await this.buildReviewLikeMessage(
            _id_user_sender,
            _id_user_receiver,
            _id_target
        );

        // Check if the message is null (indicating that the notification should be skipped)
        if (!message) {
            console.log("Notification skipped due to missing FCM token.");
            return null;
        }

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
                // TODO: agregar log de error
            });

        // Save to db
        const notification = await Notification.create({
            _id_user_sender,
            _id_user_receiver,
            _id_target: _id_user_sender,
            type: "review",
            subject: message.notification.title,
            content: message.notification.body,
            is_valid: true,
        });

        return notification;
    }

    async buildReviewLikeMessage(
        _id_user_sender,
        _id_user_receiver,
        _id_target
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
                title: `A ${sender.nick_name} le gustó tu reseña`,
                body: "Juntos podemos romper barreras ¡No desaproveches esta oportunidad!",
            },
            data: {
                _id_target,
                target_type: "review",
            },
            token: receiver.fcm_token,
        };
        return message;
    }

    // Handles notification construction and sends it
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
        admin
            .messaging()
            .send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log("Successfully sent message:", response);
            })
            .catch((error) => {
                console.log("Error sending message:", error);
                // TODO: agregar log de error
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

        // Check if the receiver has an FCM token
        if (!receiver || !receiver.fcm_token) {
            console.log("Receiver has no FCM token. Skipping notification.");
            return null; // Return null to indicate skipping the notification
        }

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
}

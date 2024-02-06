import { User } from "../models/users.js";
import { Notification } from "../models/notifications.js";

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
            where: { _id_user_receiver },
        });

        if (notifications.length === 0) {
            return res
                .status(404)
                .send({ message: "No notifications found for this user" });
        }

        res.status(200).send({ message: "Notifications found", notifications });
    } catch (error) {
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

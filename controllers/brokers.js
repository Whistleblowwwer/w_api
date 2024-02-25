import { Broker } from "../models/broker.js";
import { User } from "../models/users.js";
import { sendNotificationEmails } from "../utils/mailMan.js";

// Creates an assistant or attorney.
// Creates an assistant or attorney. Phone number is not required.
export const createBroker = async (req, res) => {
    try {
        // Extract data from the request body
        const { name, last_name, INE, phone_number, email, type, img_url } =
            req.body;

        // Check for required fields
        if (!name || !last_name || !type || !email) {
            return res
                .status(400)
                .json({ message: "Required fields are missing" });
        }

        // Check if the user is an admin
        const user = await User.findByPk(req.user._id_user);
        if (!user || user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Permission Denied. User must be an admin." });
        }

        // Create the broker in the database
        const newBroker = await Broker.create({
            name,
            last_name,
            INE,
            phone_number,
            email,
            type,
            img_url,
        });

        return res.status(201).json({
            message: "Broker created successfully",
            broker: newBroker,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateBroker = async (req, res) => {
    const _id_user = req.user._id_user;
    const _id_broker = req.query;

    try {
        // Check if the user is an admin
        const user = await User.findByPk(_id_user);
        if (!user || user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Permission Denied. User must be an admin." });
        }

        // Extract data from the request body
        const { name, last_name, INE, phone_number, email, type, img_url } =
            req.body;

        // Update the broker in the database
        const updatedBroker = await Broker.update(
            { name, last_name, INE, phone_number, email, type, img_url },
            { where: { _id_broker } }
        );

        return res.status(200).json({
            message: "Broker updated successfully",
            broker: updatedBroker,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Soft delete the broker. is_valid:false
// Has to be admin
export const deleteBroker = async (req, res) => {
    try {
        // Check if the user requesting is an admin
        const isAdmin = await User.findOne({
            where: { _id_user: req.user._id_user, role: "admin" },
        });
        if (!isAdmin) {
            return res
                .status(403)
                .json({ message: "Permission Denied. User must be an admin." });
        }

        // Soft delete the broker in the database
        await Broker.update(
            { is_valid: false },
            { where: { _id_broker: req.params.id } }
        );

        return res.status(200).json({ message: "Broker deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Gets all the fields of the broker
export const getBrokerDetails = async (req, res) => {
    try {
        // Retrieve the broker details from the database
        const broker = await Broker.findOne({
            where: { _id_broker: req.params.id },
        });

        if (!broker) {
            return res.status(404).json({ message: "Broker not found" });
        }

        return res.status(200).json({ broker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Gets list of attorneys.
export const getAttorneys = async (req, res) => {
    try {
        // Retrieve the list of attorneys from the database
        const attorneys = await Broker.findAll({
            where: { type: "attorney", is_valid: true },
        });

        return res.status(200).json({ attorneys });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Gets list of assistants.
export const getAssistants = async (req, res) => {
    try {
        // Retrieve the list of assistants from the database
        const assistants = await Broker.findAll({
            where: { type: "assistant", is_valid: true },
        });

        return res.status(200).json({ assistants });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessageToAttorney = async (req, res) => {
    const _id_user = req.user._id_user;
    try {
        // Extract data from the request body
        const { message, _id_attorney } = req.body;

        const attorney = await Broker.findOne({
            where: { _id_broker: _id_attorney, is_valid: true },
        });

        if (!attorney) {
            return res
                .status(404)
                .json({ message: "No active attorney found" });
        }

        const user = await User.findOne({
            where: { _id_user, is_valid: true },
        });

        await sendNotificationEmails(user, attorney, message, "attorney");

        return res
            .status(200)
            .json({ message: "Message sent to attorney successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessageToAssistant = async (req, res) => {
    try {
        // Extract data from the request body
        const { message } = req.body;

        // Fetch the assistant data from the database (adjust the condition based on your logic)
        const assistant = await Broker.findOne({
            where: { type: "assistant", is_valid: true },
        });

        if (!assistant) {
            return res
                .status(404)
                .json({ message: "No active assistant found" });
        }

        // Pass user data to the sendNotificationEmails function
        const userData = {
            _id_user: req.user._id_user,
            name: req.user.name,
            last_name: req.user.last_name,
            email: req.user.email,
        };
        await sendNotificationEmails(userData, message, "assistant");

        return res
            .status(200)
            .json({ message: "Message sent to assistant successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

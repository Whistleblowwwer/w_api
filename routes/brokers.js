import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    createBroker,
    getAssistants,
    getAttorneys,
    getBrokerDetails,
    updateBroker,
    deleteBroker,
    sendMessageToAttorney,
    sendMessageToAssistant,
} from "../controllers/brokers.js";

const router = Router();

//----------Brokers Routes-------------

// Create Broker
router.post("/", validateUser, createBroker);

// Update Broker
router.put("/", validateUser, updateBroker);

// Delete Broker
router.delete("/:id", validateUser, deleteBroker);

// Get All Attorneys
router.get("/attorneys", validateUser, getAttorneys);

// Get All Assistants
router.get("/assistants", validateUser, getAssistants);

// Get Broker Details
router.get("/:id", validateUser, getBrokerDetails);

// Send Message to Attorney
router.post("/attorney/message", validateUser, sendMessageToAttorney);

// Send Message to Assistant
router.post("/assistant/message", validateUser, sendMessageToAssistant);

export default router;

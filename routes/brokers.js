import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
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
router.post("/", validateToken, createBroker);

// Update Broker
router.put("/", validateToken, updateBroker);

// Delete Broker
router.delete("/", validateToken, deleteBroker);

// Get All Attorneys
router.get("/attorneys", validateToken, getAttorneys);

// Get All Assistants
router.get("/assistants", validateToken, getAssistants);

// Get Broker Details
router.get("/:id", validateToken, getBrokerDetails);

// Send Message to Attorney
router.post("/attorney/message", validateToken, sendMessageToAttorney);

// Send Message to Assistant
router.post("/assistant/message", validateToken, sendMessageToAssistant);

export default router;

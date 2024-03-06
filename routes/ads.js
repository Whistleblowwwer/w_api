import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    createAd,
    getAdById,
    getAllActiveAds,
    updateAd,
    deleteAd,
    getAdsByType,
} from "../controllers/ads.js";

const router = Router();

// Create a new ad
router.post("/", validateUser, createAd);

// Get all valid and active ads
router.get("/", getAllActiveAds);

// Get an ad by ID
router.get("/:id", getAdById);

// Update an ad
router.put("/:id", validateUser, updateAd);

// Soft delete an ad
router.delete("/:id", validateUser, deleteAd);

// Get all banner type ads
router.get("/type/:type", getAdsByType);

export default router;

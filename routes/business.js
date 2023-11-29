import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import {
    createBusiness,
    getBusinessDetails,
    listAllBusinesses,
    getMyBusinesses,
    updateBusiness,
    deleteBusiness,
    searchBusiness,
    getBusinessFeed
} from "../controllers/business.js";

const router = Router();

//----------Business Routes-------------

//Create Business
router.post("/", validateToken, createBusiness);

//Get Business Details
router.get("/details", validateToken, getBusinessDetails);

//Get Business List
router.get("/", validateToken, listAllBusinesses);

//Get User Business
router.get("/my-businesses", validateToken, getMyBusinesses);

//Update Business
router.put("/", validateToken, updateBusiness);

//Delete Business
router.patch("/", validateToken, deleteBusiness);

//Search Business
router.get("/search", validateToken, searchBusiness);

//Search Business
router.get("/feed", validateToken, getBusinessFeed);

export default router;

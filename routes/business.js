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
router.put("/:_id_business", validateToken, updateBusiness);

//Delete Business
router.patch("/:_id_business", validateToken, deleteBusiness);

//Search Business
router.get("/search", validateToken, searchBusiness);

export default router;

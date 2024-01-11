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
    searchBusinessByNameAndEntity,
    getBusinessFeed,
    getFollowedBusinessFeed,
    getNonFollowedBusinessFeed
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

//Search Business Only by Name/Entity
router.get("/search-name-entity", validateToken, searchBusinessByNameAndEntity);

//Business Feed
router.get("/feed", validateToken, getBusinessFeed);

//Followed Business Feed
router.get("/followed/feed", validateToken, getFollowedBusinessFeed);

//Non Followed Business Feed
router.get("/non-followed/feed", validateToken, getNonFollowedBusinessFeed);

export default router;

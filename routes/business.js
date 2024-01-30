import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js"; // Import the validateUser middleware
import {
    createBusiness,
    getBusinessDetails,
    listAllBusinesses,
    getMyBusinesses,
    updateBusiness,
    deleteBusiness,
    searchBusinessByNameAndEntity,
    getBusinessFeed,
    getFollowedBusinessFeed,
    getNonFollowedBusinessFeed,
} from "../controllers/business.js";

const router = Router();

//----------Business Routes-------------

//Create Business
router.post("/", validateUser, createBusiness);

//Get Business Details
router.get("/details", validateUser, getBusinessDetails);

//Get Business List
router.get("/", validateUser, listAllBusinesses);

//Get User Business
router.get("/my-businesses", validateUser, getMyBusinesses);

//Update Business
router.put("/", validateUser, updateBusiness);

//Delete Business
router.patch("/", validateUser, deleteBusiness);

//Search Business
router.get("/search", validateUser, searchBusinessByNameAndEntity);

//Search Business Only by Name/Entity
router.get("/search-name-entity", validateUser, searchBusinessByNameAndEntity);

//Business Feed
router.get("/feed", validateUser, getBusinessFeed);

//Followed Business Feed
router.get("/followed/feed", validateUser, getFollowedBusinessFeed);

//Non Followed Business Feed
router.get("/non-followed/feed", validateUser, getNonFollowedBusinessFeed);

export default router;

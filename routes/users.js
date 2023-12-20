import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    createUser,
    logIn,
    updateUser,
    getUserDetails,
    likeReview,
    likeComment,
    followUser,
    followBusiness,
    deactivateUser,
    nukeUser,
    VerifySMS,
    sendSMS,
    searchUser,
    verifyToken,
    getUserLikes,
    getUserReviews,
    getUserComments,
    getRandomUsers,
} from "../controllers/users.js";

const router = Router();

//----------User Routes-------------

//Create User
router.post("/", createUser);

//Log In
router.post("/login", logIn);

//Update User
router.put("/", validateToken, updateUser);

//Get User Details
router.get("/", validateToken, getUserDetails);

//Like Review
router.post("/reviews/like", validateToken, likeReview);

//Reviews made by User
router.get("/reviews", validateToken, getUserReviews);

//Like Comment
router.post("/comments/like", validateToken, likeComment);

//Follow User
router.post("/follow", validateToken, followUser);

//Follow Business
router.post("/business/follow", validateToken, followBusiness);

//Deactivate User
router.patch("/deactivate", validateToken, deactivateUser);

//Nuke User
router.delete("/delete/all", validateToken, nukeUser);

//Search User
router.get("/search", validateToken, searchUser);

//Send SMS
router.get("/sendsms", sendSMS);

//Verify SMS
router.get("/verifysms", VerifySMS);

// Validate token
router.get("/token", validateToken, verifyToken);

// Get Liked Reviews by User
router.get("/likes", validateToken, getUserLikes);

//Get User Comments
router.get("/comments", validateToken, getUserComments);

//Get Random User Recommendation
router.get("/recommendation", validateToken, getRandomUsers);

export default router;

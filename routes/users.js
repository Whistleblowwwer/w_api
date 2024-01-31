import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
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
    searchUser,
    verifyToken,
    getUserLikes,
    getUserReviews,
    getUserComments,
    getRandomUsers,
    validateOtp,
    requestOtp,
    changeUserPassword,
    blockUser,
    unBlockUser,
    getFollowedBusinesses,
} from "../controllers/users.js";
import { subscribeFCM } from "../controllers/pushNotifications.js";
const router = Router();

//----------User Routes-------------

// Create User
router.post("/", createUser);

// Log In
router.post("/login", logIn);

// Update User
router.put("/", validateUser, updateUser);

// Get User Details
router.get("/", validateUser, getUserDetails);

// Like Review
router.post("/reviews/like", validateUser, likeReview);

// Reviews made by User
router.get("/reviews", validateUser, getUserReviews);

// Like Comment
router.post("/comments/like", validateUser, likeComment);

// Follow User
router.post("/follow", validateUser, followUser);

// Follow Business
router.post("/business/follow", validateUser, followBusiness);

// Deactivate User
router.patch("/deactivate", validateUser, deactivateUser);

// Nuke User
router.delete("/delete/all", validateUser, nukeUser);

// Search User
router.get("/search", validateUser, searchUser);

// Validate token
router.get("/token", validateUser, verifyToken);

// Get Liked Reviews by User
router.get("/likes", validateUser, getUserLikes);

// Get User Comments
router.get("/comments", validateUser, getUserComments);

// Get Random User Recommendation
router.get("/recommendation", validateUser, getRandomUsers);

// Validate de OTP
router.post("/validate-otp", validateOtp);

// Request an OTP
router.get("/send-otp", requestOtp);

// Change user password
router.patch("/change-password", changeUserPassword);

// Block User
router.get("/block", validateUser, blockUser);

// Unblock User
router.get("/unblock", validateUser, unBlockUser);

// Followed Businesses
router.get("/business/followed", validateUser, getFollowedBusinesses);

// Subscribe to push notifications
router.post("/notifications/subscribe", validateUser, subscribeFCM);

export default router;

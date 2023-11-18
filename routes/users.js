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
    VerifySMS,
    sendSMS,
    searchUser
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
router.get("/:_id_user", validateToken, getUserDetails);

//Like Review
router.post("/reviews/like", validateToken, likeReview);

//Like Comment
router.post("/comments/like", validateToken, likeComment);

//Follow User
router.post("/follow", validateToken, followUser);

//Follow Business
router.post("/business/follow", validateToken, followBusiness);

//Deactivate User
router.patch("/deactivate", validateToken, deactivateUser);

//Search User 
router.get("/search", validateToken, searchUser);

router.get('/sendsms', sendSMS);

router.get('/verifysms', VerifySMS);

export default router;

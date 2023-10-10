import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    createUser,
    logIn,
    updateUser,
    getUserDetails,
    likeReview,
    followUser,
    followBusiness,
    deactivateUser,
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
router.post("/reviews/:_id_review/like", validateToken, likeReview);

//Follow User
router.post("/:_id_followed/follow", validateToken, followUser);

//Follow Business
router.post("/business/:_id_business/follow", validateToken, followBusiness);

//Deactivate User
router.patch("/deactivate", deactivateUser);

export default router;

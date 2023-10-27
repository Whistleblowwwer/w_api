import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    uploadPhoto,
    uploadVideo,
    getFile
} from "../controllers/bucket.js";

const router = Router();

//----------Bucket Routes-------------

//Add/Change Image to User/Buisiness/Review
router.post("/", validateToken, uploadPhoto);
router.post("/video", validateToken, uploadVideo);
router.get("/", validateToken, getFile);

export default router;

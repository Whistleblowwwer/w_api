import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    uploadFile,
} from "../controllers/bucket.js";

const router = Router();

//----------Bucket Routes-------------

//Add/Change Image to User/Buisiness/Review
router.post("/" ,uploadFile);

export default router;

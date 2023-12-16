import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js";
import {
    uploadFile,
    getUrl
} from "../controllers/bucket.js";

const router = Router();

//----------Bucket Routes-------------

//Add/Change Image to User/Buisiness/Review
router.post("/",validateToken ,uploadFile);

router.get("/", validateToken, getUrl);

export default router;

import { Router } from "express";
import { validateUser } from "../middlewares/ClientValidations.js";
import {
    uploadFile,
    getUrl,
    UploadCommentImage,
    UploadReviewImage,
} from "../controllers/bucket.js";

const router = Router();

//----------Bucket Routes-------------

//Add/Change Image to User/Buisiness/Review
router.post("/", validateUser, uploadFile);

router.post("/comment", validateUser, UploadCommentImage);

router.post("/review", validateUser, UploadReviewImage);

router.get("/", validateUser, getUrl);

export default router;

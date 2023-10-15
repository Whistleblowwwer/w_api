import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { 
    createBusiness,
    updateBusiness,
    deleteBusiness
} from "../controllers/business.js";

const router = Router();

//----------Business Routes-------------

//Create Business
router.post('/', validateToken, createBusiness);

//Update Business
router.put('/:_id_business', validateToken, updateBusiness);

//Delete Business
router.patch('/:_id_business', validateToken, deleteBusiness);

export default router;
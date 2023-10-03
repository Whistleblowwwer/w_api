import { Router } from "express";
import { validateToken } from "../middlewares/jwt.js"; // Import the validateToken middleware
import { createUser, logIn, updateUser, getUserDetails} from "../controllers/users.js";

const router = Router();

//----------User Routes-------------

//Create User
router.post('/', createUser);

//Log In
router.post('/login', logIn);

//Update User
router.put('/:_id_user', validateToken, updateUser);

//Get User Details
router.get('/:_id_user',validateToken, getUserDetails);

//Like Review
// router.post('/reviews/:_id_review/like', likeReview);

//Follow User
// router.post('/:_id_user/follow', followUser);

//Follow Business
// router.post('/business/:_id_business/follow', followBusiness);

//Deactivate User
// router.put('/:_id_user/deactivate', deactivateUser);

export default router;

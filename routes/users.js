import { Router } from "express";
import { validateToken } from "../helpers/jwt.js"; // Import the validateToken middleware
import // getUser,
// createUser,
// loginUser,
// access_code,
// resetPassword,
// deactivateUser,
// gtokens,
"../controllers/users.js";

const router = Router();

// Routes
// router.get("/:id", validateToken, getUser);
// router.post("/login", loginUser);
// router.get("/access_code/:code", access_code);
// router.post("/", createUser);
// router.put("/resetPass", validateToken, resetPassword);
// router.put("/:id", validateToken, updateUser);
// router.delete("/deactivate/:_id_user", validateToken, deactivateUser);
// router.get("/gtokens", gtokens);

export default router;

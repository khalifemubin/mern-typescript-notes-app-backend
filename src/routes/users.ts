import express from "express";
import * as UserController from "../controllers/users";
import { requiresAuth } from "../middleware/auth";
// import env from "../utils/validateEnv";

const router = express.Router();

// router.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", env.FRONTEND_URL);
//     res.header("Access-Control-Allow-Credentials", "true");
//     // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

router.get("/", requiresAuth, UserController.getAuthenticatedUser);
router.post("/signup", UserController.signUp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

export default router;


import { Router } from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  logoutUser,
  getUserProfile
} from '../controller/User.Controller.js'
import { verifyJWTForUser } from "../middleware/auth.middleware.js";




const router = Router();

router.route("/register").post( registerUser );
router.route("/login").post( loginUser );
router.route("/google").post( googleAuth );
router.route("/logout").get( verifyJWTForUser , logoutUser );
router.route("/userProfile").get( verifyJWTForUser , getUserProfile );






export default router

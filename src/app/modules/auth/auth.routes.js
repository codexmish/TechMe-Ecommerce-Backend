import { Router } from "express";
import { zodValidation } from "../../middleWares/zodValidationCheck.js";
import { userSignupSchema } from "./auth.validation.js";
import { authControllers } from "./auth.controller.js";
import { limiter } from "../../utils/rateLimit.js";

const router = Router();

// -----signup router
router.post(
	"/signup",
	limiter(10 * 60 * 1000, 5, false),
	zodValidation(userSignupSchema),
	authControllers.signupController,
);

export const authRoutes = router;

import { Router } from "express";
import { zodValidation } from "../../middleWares/zodValidationCheck.js";
import { limiter } from "../../utils/rateLimit.js";
import { authControllers } from "./auth.controller.js";
import { emailSchema, otpSchema, refreshTokenSchema, resetPasswordSchema, userLoginSchema, userSignupSchema } from "./auth.validation.js";

const router = Router();
const authLimiter = limiter(10 * 60 * 1000, 5, false);

router.post("/signup", authLimiter, zodValidation(userSignupSchema), authControllers.signupController);
router.post("/signin", authLimiter, zodValidation(userLoginSchema), authControllers.loginController);
router.post("/login", authLimiter, zodValidation(userLoginSchema), authControllers.loginController);
router.post("/verify-otp", authLimiter, zodValidation(otpSchema), authControllers.verifyOtpController);
router.post("/resend-otp", authLimiter, zodValidation(emailSchema), authControllers.resendOtpController);
router.post("/forgot-password", authLimiter, zodValidation(emailSchema), authControllers.forgotPasswordController);
router.post("/reset-password", authLimiter, zodValidation(resetPasswordSchema), authControllers.resetPasswordController);
router.post("/refresh", authLimiter, zodValidation(refreshTokenSchema), authControllers.refreshController);
router.post("/logout", zodValidation(refreshTokenSchema), authControllers.logoutController);

export const authRoutes = router;


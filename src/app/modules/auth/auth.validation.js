import z from "zod";

// -----auth validation
export const userSignupSchema = z
  .object({
    name: z.string("Name is required").trim().min(3).max(80),

    email: z.email("Invalid email address").toLowerCase(),

    password: z
      .string("Password is required")
      .min(6, "password must be at least 6 characters long")
      .max(72, "Password must be at most 72 characters"),
  })
  .strict();

export const userLoginSchema = z
  .object({
    email: z.email("Invalid email address").toLowerCase(),
    password: z.string("Password is required").min(6).max(72),
  })
  .strict();

export const refreshTokenSchema = z
  .object({ refreshToken: z.string().min(1) })
  .strict();
export const emailSchema = z
  .object({ email: z.email().toLowerCase() })
  .strict();
export const otpSchema = z
  .object({
    email: z.email().toLowerCase(),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  })
  .strict();
export const resetPasswordSchema = otpSchema
  .extend({ password: z.string().min(8).max(72) })
  .strict();

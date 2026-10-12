import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// -----rules for every env variable
const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	PORT: z.coerce.number().int().positive().default(8000),
	BASE_URL: z.string().startsWith("/"),
	CLIENT_URL: z.url(),
	DATABASE_URL: z.string().startsWith("mongodb"),
	BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8),
	JWT_ACCESS_SECRET: z.string().min(32),
	JWT_REFRESH_SECRET: z.string().min(32),
	JWT_ACCESS_EXPIRES_IN: z.string().min(1),
	JWT_REFRESH_EXPIRES_IN: z.string().min(1),

	// -----not used yet: make these required when the feature is built
	SMTP_USER: z.string().optional(),
	SMTP_PASS: z.string().optional(),
	CLOUDINARY_CLOUD_NAME: z.string().optional(),
	CLOUDINARY_API_KEY: z.string().optional(),
	CLOUDINARY_API_SECRET: z.string().optional(),
	REDIS_USER: z.string().optional(),
	REDIS_PASS: z.string().optional(),
	REDIS_HOST: z.string().optional(),
	REDIS_PORT: z.string().optional(),
});

// -----stop the app if any env variable is missing or wrong
const result = envSchema.safeParse(process.env);

if (!result.success) {
	console.error("Invalid environment variables in .env:");
	for (const issue of result.error.issues) {
		console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
	}
	process.exit(1);
}

const env = result.data;

export default {
	node_env: env.NODE_ENV,
	port: env.PORT,
	CLIENT_URL: env.CLIENT_URL,
	BASE_URL: env.BASE_URL,
	DATABASE_URL: env.DATABASE_URL,
	SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS,
	REDIS_USER: env.REDIS_USER,
	REDIS_PASS: env.REDIS_PASS,
	REDIS_HOST: env.REDIS_HOST,
	REDIS_PORT: env.REDIS_PORT,
	SMTP_USER: env.SMTP_USER,
	SMTP_PASS: env.SMTP_PASS,
	JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
	JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
	JWT_ACCESS_EXPIRES_IN: env.JWT_ACCESS_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN: env.JWT_REFRESH_EXPIRES_IN,
	CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
};

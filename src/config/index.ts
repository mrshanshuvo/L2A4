import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const envSchema = z.object({
  DATABASE_URL: z.url({
    error: (issue) =>
      issue.input === undefined || issue.input === ""
        ? "DATABASE_URL is required"
        : "DATABASE_URL must be a valid URL",
  }),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.url({
    error: (issue) =>
      issue.input === undefined || issue.input === ""
        ? "APP_URL is required"
        : "APP_URL must be a valid URL",
  }),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
  JWT_ACCESS_SECRET: z.string({ error: "JWT_ACCESS_SECRET is required" }),
  JWT_REFRESH_SECRET: z.string({ error: "JWT_REFRESH_SECRET is required" }),
  JWT_ACCESS_EXPIRATION: z.string({
    error: "JWT_ACCESS_EXPIRATION is required",
  }),
  JWT_REFRESH_EXPIRATION: z.string({
    error: "JWT_REFRESH_EXPIRATION is required",
  }),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export default {
  database_url: parsedEnv.data.DATABASE_URL,
  port: parsedEnv.data.PORT,
  app_url: parsedEnv.data.APP_URL,
  bcrypt_salt_rounds: parsedEnv.data.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: parsedEnv.data.JWT_ACCESS_SECRET,
  jwt_refresh_secret: parsedEnv.data.JWT_REFRESH_SECRET,
  jwt_access_expiration: parsedEnv.data.JWT_ACCESS_EXPIRATION,
  jwt_refresh_expiration: parsedEnv.data.JWT_REFRESH_EXPIRATION,
  stripe_price_id: parsedEnv.data.STRIPE_PRICE_ID,
  stripe_secret_key: parsedEnv.data.STRIPE_SECRET_KEY,
  stripe_webhook_secret: parsedEnv.data.STRIPE_WEBHOOK_SECRET,
};

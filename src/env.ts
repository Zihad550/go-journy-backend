import dotenv from "dotenv";
import path from "path";
import { z, ZodError } from "zod";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const EnvSchema = z
  .object({
    // env
    NODE_ENV: z.enum(["development", "production"]).default("development"),

    // server
    PORT: z.coerce.number(),

    // db
    DEVELOPMENT_DB_URL: z.string(),
    PRODUCTION_DB_URL: z.string(),
    // jwt
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    JWT_ACCESS_EXPIRES_IN: z.string(),
    JWT_REFRESH_EXPIRES_IN: z.string(),

    // frontend
    PRODUCTION_FRONTEND_URL: z.string(),
    DEVELOPMENT_FRONTEND_URL: z.string(),

    // smpt
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_HOST: z.string(),
    SMTP_FROM: z.string(),

    // backend urls
    DEVELOPMENT_BACKEND_URL: z.string(),
    PRODUCTION_BACKEND_URL: z.string(),

    // super admin
    SUPER_ADMIN_PASSWORD: z.string(),
    SUPER_ADMIN_EMAIL: z.string(),
  })
  .transform((data) => {
    const {
      // smpt
      SMTP_HOST,
      SMTP_PASS,
      SMTP_PORT,
      SMTP_USER,
      SMTP_FROM,
      // frontend urls
      PRODUCTION_FRONTEND_URL,
      DEVELOPMENT_FRONTEND_URL,
      // backend urls
      DEVELOPMENT_BACKEND_URL,
      PRODUCTION_BACKEND_URL,
      // db
      PRODUCTION_DB_URL,
      DEVELOPMENT_DB_URL,

      ...rest
    } = data;
    const frontend_url =
      data.NODE_ENV === "development"
        ? DEVELOPMENT_FRONTEND_URL
        : PRODUCTION_FRONTEND_URL;
    const backend_url =
      data.NODE_ENV === "development"
        ? DEVELOPMENT_BACKEND_URL
        : PRODUCTION_BACKEND_URL;
    const db_url =
      data.NODE_ENV === "development" ? DEVELOPMENT_DB_URL : PRODUCTION_DB_URL;
    return {
      ...rest,
      FRONTEND_URL: frontend_url,
      BACKEND_URL: backend_url,
      DB_URL: db_url,

      EMAIL_SENDER: {
        SMTP_HOST,
        SMTP_PASS,
        SMTP_PORT,
        SMTP_USER,
        SMTP_FROM,
      },
    };
  });

try {
  EnvSchema.parse(process.env);
} catch (err) {
  if (err instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    message += Object.keys(z.flattenError(err).fieldErrors).join("\n");
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else console.error(err);
}

export default EnvSchema.parse(process.env);

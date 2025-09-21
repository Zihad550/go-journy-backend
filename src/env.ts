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
    DEVELOPMENT_FRONTEND_DOMAIN: z.string(),
    PRODUCTION_FRONTEND_DOMAIN: z.string(),

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

    // ssl commerz
    SSL_STORE_ID: z.string(),
    SSL_STORE_PASS: z.string(),
    SSL_PAYMENT_API: z.string(),
    SSL_VALIDATION_API: z.string(),
    SSL_SUCCESS_FRONTEND_PATH: z.string(),
    SSL_FAIL_FRONTEND_PATH: z.string(),
    SSL_CANCEL_FRONTEND_PATH: z.string(),
    SSL_SUCCESS_BACKEND_PATH: z.string(),
    SSL_FAIL_BACKEND_PATH: z.string(),
    SSL_CANCEL_BACKEND_PATH: z.string(),
    SSL_BACKEND_IPN_PATH: z.string(),

    // cloudinary
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),

    // mapbox
    MAPBOX_ACCESS_TOKEN: z.string(),
    MAPBOX_DIRECTIONS_API_URL: z.string(),
    MAPBOX_GEOCODING_API_URL: z.string(),

    // location service rate limits
    LOCATION_UPDATE_RATE_LIMIT: z.coerce.number().default(30),
    LOCATION_UPDATE_WINDOW_MS: z.coerce.number().default(60000),
    GEOCODING_RATE_LIMIT: z.coerce.number().default(10),
    PLACES_SEARCH_RATE_LIMIT: z.coerce.number().default(20),

    // google oauth
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_CALLBACK_PATH: z.string(),

    // redis
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    REDIS_USERNAME: z.string(),
    REDIS_PASSWORD: z.string(),
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
      PRODUCTION_FRONTEND_DOMAIN,
      DEVELOPMENT_FRONTEND_DOMAIN,

      // backend urls
      DEVELOPMENT_BACKEND_URL,
      PRODUCTION_BACKEND_URL,
      // db
      PRODUCTION_DB_URL,
      DEVELOPMENT_DB_URL,
      // ssl commerz
      SSL_STORE_ID,
      SSL_STORE_PASS,
      SSL_PAYMENT_API,
      SSL_VALIDATION_API,
      SSL_SUCCESS_FRONTEND_PATH,
      SSL_FAIL_FRONTEND_PATH,
      SSL_CANCEL_FRONTEND_PATH,
      SSL_SUCCESS_BACKEND_PATH,
      SSL_FAIL_BACKEND_PATH,
      SSL_CANCEL_BACKEND_PATH,
      SSL_BACKEND_IPN_PATH,
      // cloudinary
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET,
      // gogle
      GOOGLE_CALLBACK_PATH,

      ...rest
    } = data;
    const frontend_url =
      data.NODE_ENV === "development"
        ? DEVELOPMENT_FRONTEND_URL
        : PRODUCTION_FRONTEND_URL;
    const frontend_domain =
      data.NODE_ENV === "development"
        ? DEVELOPMENT_FRONTEND_DOMAIN
        : PRODUCTION_FRONTEND_DOMAIN;
    const backend_url =
      data.NODE_ENV === "development"
        ? DEVELOPMENT_BACKEND_URL
        : PRODUCTION_BACKEND_URL;
    const db_url =
      data.NODE_ENV === "development" ? DEVELOPMENT_DB_URL : PRODUCTION_DB_URL;
    return {
      ...rest,
      FRONTEND_URL: frontend_url,
      FRONTEND_DOMAIN: frontend_domain,
      BACKEND_URL: backend_url,
      DB_URL: db_url,

      EMAIL_SENDER: {
        SMTP_HOST,
        SMTP_PASS,
        SMTP_PORT,
        SMTP_USER,
        SMTP_FROM,
      },

      SSL_CONFIG: {
        STORE_ID: SSL_STORE_ID,
        STORE_PASS: SSL_STORE_PASS,
        PAYMENT_API: SSL_PAYMENT_API,
        VALIDATION_API: SSL_VALIDATION_API,
        SUCCESS_FRONTEND_PATH: SSL_SUCCESS_FRONTEND_PATH,
        FAIL_FRONTEND_PATH: SSL_FAIL_FRONTEND_PATH,
        CANCEL_FRONTEND_PATH: SSL_CANCEL_FRONTEND_PATH,
        SUCCESS_BACKEND_PATH: SSL_SUCCESS_BACKEND_PATH,
        FAIL_BACKEND_PATH: SSL_FAIL_BACKEND_PATH,
        CANCEL_BACKEND_PATH: SSL_CANCEL_BACKEND_PATH,
        BACKEND_IPN_PATH: SSL_BACKEND_IPN_PATH,
      },

      CLOUDINARY_CONFIG: {
        CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
        API_KEY: CLOUDINARY_API_KEY,
        API_SECRET: CLOUDINARY_API_SECRET,
      },
      GOOGLE_CALLBACK_URL: `${backend_url}${GOOGLE_CALLBACK_PATH}`,
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

import dotenv from "dotenv";

dotenv.config();

const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI,

    // Authentication
    JWT_SECRET: process.env.JWT_SECRET || "daymark_news_jwt_secret_change_in_production_key_12345",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // Cloudflare R2 Storage Configuration
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || "",
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || "",
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || "",
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || "",
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || ""
};

export default env;

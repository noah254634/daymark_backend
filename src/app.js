import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import corsOptions from "./config/cors.js";
import apiRoutes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";

const app = express();

// Security
app.use(helmet());

// Cross-origin configuration with credentials enabled
app.use(cors(corsOptions));

// Cookie parsing
app.use(cookieParser());

// Request logging
app.use(morgan("dev"));

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", apiRoutes);

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Daymark API is operational",
        data: {
            service: "Daymark Backend",
            version: "1.0.0",
            environment: process.env.NODE_ENV
        },
        meta: null
    });
});

// Handle unknown routes
app.use(notFound);

// Global error handler (must remain last)
app.use(errorHandler);

export default app;

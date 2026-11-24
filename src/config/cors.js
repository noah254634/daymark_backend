import env from "./environment.js";

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow mobile apps, curl, Postman, server-to-server requests with no origin
        if (!origin) return callback(null, true);

        if (env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS policy: This origin is not authorized"));
    },
    credentials: true, // Required for httpOnly cookies across origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

export default corsOptions;

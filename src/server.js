import app from "./app.js";
import connectDB from "./config/database.js";
import env from "./config/environment.js";

const startServer = async () => {
    try {
        // Establish database connection
        await connectDB();

        // Start HTTP server
        const server = app.listen(env.PORT, () => {
            console.log(`
========================================
       DAYMARK NEWS API
========================================
Environment: ${env.NODE_ENV}
Port:        ${env.PORT}
URL:         http://localhost:${env.PORT}
========================================
            `);
        });

        // Handle unexpected server errors
        server.on("error", (error) => {
            console.error("Server error:", error);
            process.exit(1);
        });

    } catch (error) {
        console.error("Application startup failed:", error);
        process.exit(1);
    }
};

startServer();
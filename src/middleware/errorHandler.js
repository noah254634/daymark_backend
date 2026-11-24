const getErrorLocation = (stack) => {
    if (!stack) return null;

    const frames = stack.split("\n").slice(1);

    const applicationFrame = frames.find(frame =>
        frame.includes("/src/") || frame.includes("\\src\\")
    );

    if (!applicationFrame) return null;

    return applicationFrame.trim()
        .replace(/^at\s+/, "")
        .replace(/^.*?file:\/\/\//, "")
        .replace(/\\/g, "/")
        .replace(/^.*?\/(src\/)/, "$1")
        .replace(/\)$/, "");
};

const errorHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || null;

    // Invalid MongoDB ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource identifier";
    }

    // Duplicate MongoDB document
    if (err.code === 11000) {
        statusCode = 409;
        message = "Resource already exists";
    }

    // Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed";

        errors = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message
        }));
    }

    // Log complete error internally
    console.error({
        error: err.message,
        type: err.name,
        method: req.method,
        path: req.originalUrl,
        stack: err.stack
    });

    // Development debugging information
    const debug = process.env.NODE_ENV === "development"
        ? {
            type: err.name,
            location: getErrorLocation(err.stack)
        }
        : undefined;

    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        errors,
        ...(debug && { debug })
    });
};

export default errorHandler;

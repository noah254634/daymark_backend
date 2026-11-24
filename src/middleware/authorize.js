import ApiError from "../utils/ApiError.js";

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles (e.g. 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'JOURNALIST')
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `Access forbidden. Role '${req.user.role}' is not authorized to access this resource`
                )
            );
        }

        next();
    };
};

export default authorize;

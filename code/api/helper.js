const { validationResult } = require("express-validator");

class ErrorHandler {
    // Parameters errors (type, len, ...)
    validateRequest(req, res, next) {
        const errors = validationResult(req);
    
        if (!errors.isEmpty()) {
            return res.status(422)
                .json({ error: "The parameters are not formatted properly"});
        }
    
        return next();
    }
}

function registerErrorHandler(router) {
    router.use((err, req, res, next) => {
        return res.status(err.customCode || 503).json({
            error: err.customMessage || "Internal Server Error",
            status: err.customCode || 503
        });
    });
}

module.exports = { ErrorHandler, registerErrorHandler };



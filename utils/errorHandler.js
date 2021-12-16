const handleValidationError = (err, res) => {
    let errors = Object.values(err.errors).map((el) => el.message);
    let fields = Object.values(err.errors).map((el) => el.path);
    if (errors.length > 1) {
        const formattedErrors = errors.join(" ");
        res.status(400).send({ messages: formattedErrors, fields });
    } else {
        res.status(400).send({ messages: errors, fields });
    }
};

const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue);
    const error = `A user with that ${field} already exists.`;
    res.status(409).send({ messages: error, fields: field });
};

const handleAccessTokenVerificationError = (err, res) => {
    const error = "Invalid access token";
    res.status(401).send({ messages: error });
};

const handleCastError = (err, res) => {
    const error = "Resource not found";
    res.status(404).send({ messages: error });
};

module.exports = (err, req, res, next) => {
    try {
        if (err.name === "JsonWebTokenError") return (err = handleAccessTokenVerificationError(err, res));
        if (err.name === "ValidationError") return (err = handleValidationError(err, res));
        if (err.code && err.code == 11000) return (err = handleDuplicateKeyError(err, res));
        if (err.name === "CastError") return (err = handleCastError(err, res));
    } catch (err) {
        res.status(500).send({ messages: "An unknown error occurred." });
    }
};

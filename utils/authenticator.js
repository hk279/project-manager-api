const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader && authHeader.split(" ")[1];

    if (accessToken == null) return res.status(401).send({ messages: "No access token" });

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(401).send({ messages: "Invalid access token" });
        req.user = user;
        next();
    });
};

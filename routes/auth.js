var express = require("express");

const User = require("../models/user");
const authRouter = express.Router();

// Get a user with given login info
authRouter.post("/login", (req, res) => {
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

module.exports = authRouter;

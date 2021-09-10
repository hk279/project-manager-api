var express = require("express");

const User = require("../models/user");
const usersRouter = express.Router();

// Get a user with given login info
usersRouter.post("/login", (req, res) => {
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Change password
usersRouter.put("/change-password/:id", (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

module.exports = usersRouter;

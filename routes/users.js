var express = require("express");
require("dotenv").config();
const User = require("../models/user");
const usersRouter = express.Router();

// Change password
usersRouter.put("/change-password/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, req.body)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Get all users by organization
usersRouter.get("/org/:organizationId", (req, res, next) => {
    User.find({ organizationId: req.params.organizationId })
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// TODO
// Create a new user to an organization
usersRouter.post("/org/:organizationId", (req, res) => {});

// Update user
usersRouter.put("/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
        .then((data) => {
            let updatedUser = data;
            delete data["password"];
            res.status(200).send(updatedUser);
        })
        .catch((err) => next(err));
});

module.exports = usersRouter;

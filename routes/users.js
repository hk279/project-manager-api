var express = require("express");
require("dotenv").config();
const User = require("../models/user");
const adminCheck = require("../utils/adminCheck");
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

// Create a new user (ADMIN ONLY)
usersRouter.post("/", (req, res, next) => {
    if (!adminCheck(req)) {
        return res.status(403).send({ messages: "Unauthorized user" });
    }

    User.create(req.body)
        .then((data) => res.status(201).send(data))
        .catch((err) => next(err));
});

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

// Delete user (ADMIN ONLY)
usersRouter.delete("/:userId", (req, res, next) => {
    if (!adminCheck(req)) {
        return res.status(403).send({ messages: "Unauthorized user" });
    }

    User.findByIdAndDelete(req.params.userId)
        .then(() => res.status(204).end())
        .catch((err) => next(err));
});

module.exports = usersRouter;

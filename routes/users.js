const db = require("../mongo");
var express = require("express");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const Organization = require("../models/organization");
const usersRouter = express.Router();

// Get a user with given login info
usersRouter.post("/login", (req, res, next) => {
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((data) => {
            if (data) {
                res.send(data);
            } else {
                res.status(401).send({ messages: "Wrong email or password" });
            }
        })
        .catch((err) => {
            next(err);
        });
});

// Change password
usersRouter.put("/change-password/:id", (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body)
        .then((data) => res.send(data))
        .catch((err) => {
            next(err);
        });
});

// Get all users by organization
usersRouter.get("/org/:organizationId", (req, res, next) => {
    User.find({ organizationId: req.params.organizationId })
        .then((data) => res.send(data))
        .catch((err) => {
            next(err);
        });
});

// TODO
// Create a new user to an organization
usersRouter.post("/org/:organizationId", (req, res) => {});

// Sign up (create organization and user)
usersRouter.post("/signup/:accountType", async (req, res, next) => {
    // Create organization document
    let organization;
    if (req.params.accountType === "private") {
        organization = {
            name: `private-${uuidv4()}`, // Generate name for private account type organization
            type: "private",
        };
    } else if (req.params.accountType === "organization") {
        organization = {
            name: req.body.organization, // Name for organization account type is provided in the body
            type: "organization",
        };
    } else {
        res.status(400).send(new Error("Invalid account type"));
    }

    try {
        const session = await db.startSession();

        const createdUser = await session.withTransaction(async () => {
            // Create organization
            const result = await Organization.create([organization], { session });
            const createdOrganizationId = result[0]._id;

            // Create user document
            let userDetails = {
                ...req.body,
                userType: "admin",
                organizationId: createdOrganizationId,
                userOrganizationType: req.params.accountType,
            };
            delete userDetails["organization"];

            // Create user
            const user = await User.create([userDetails], { session });

            return user;
        });

        session.endSession();

        res.status(201).send(createdUser);
    } catch (err) {
        next(err);
    }
});

module.exports = usersRouter;

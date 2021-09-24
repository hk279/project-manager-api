var express = require("express");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");
const Organization = require("../models/organization");
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

// Get all users by organization
usersRouter.get("/org/:organizationId", (req, res) => {
    User.find({ organizationId: req.params.organizationId })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// TODO
// Create a new user to an organization
usersRouter.post("/org/:organizationId", (req, res) => {
    User.create(req.body)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Sign up (create)
usersRouter.post("/signup/:accountType", (req, res) => {
    // Todo
    // Check if email already exists

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
        res.status(500).send("Invalid account type");
    }

    var createdOrganizationId;

    Organization.create(organization)
        .then((data) => {
            createdOrganizationId = data._id;

            // Create user document
            let userDetails = {
                ...req.body,
                userType: "admin",
                organizationId: createdOrganizationId,
                userOrganizationType: req.params.accountType,
            };
            delete userDetails["organization"];

            User.create(userDetails)
                .then(() => {
                    res.status(200).send();
                })
                .catch((err) => {
                    console.log(err);
                    // Rollback user creation
                    Organization.findByIdAndDelete(createdOrganizationId)
                        .then(() => res.status(500).send("User creation failed. Create organization rolled back."))
                        .catch((err) => {
                            console.log(err);
                            res.status(500).send("Rollback failed");
                        });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Organization creation failed");
        });
});

module.exports = usersRouter;

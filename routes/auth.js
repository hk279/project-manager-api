const db = require("../mongo");
var express = require("express");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Organization = require("../models/organization");
const authRouter = express.Router();

// Login
authRouter.post("/login", async (req, res, next) => {
    try {
        // Get user by email
        const user = await User.findOne({ email: req.body.email });

        // Check password
        const passwordCorrect = user === null ? false : await bcrypt.compare(req.body.password, user.password);

        if (!passwordCorrect) return res.status(401).json({ messages: "Invalid email or password" });

        // Create access token
        let userObject = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            organizationId: user.organizationId,
            userType: user.userType,
            userOrganizationType: user.userOrganizationType,
            avatar: user.avatar,
        };
        const accessToken = jwt.sign(userObject, process.env.JWT_SECRET, { expiresIn: 60 * 60 });

        res.send({ ...userObject, accessToken });
    } catch (err) {
        next(err);
    }
});

// Sign up (create organization and user)
authRouter.post("/signup/:accountType", async (req, res, next) => {
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

            // Hash password with 10 salt rounds
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Create user document
            let userDetails = {
                ...req.body,
                password: hashedPassword,
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

module.exports = authRouter;

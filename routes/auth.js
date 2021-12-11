var express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
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
            avatar: user.avatar,
            activeWorkspace: user.defaultWorkspace,
            defaultWorkspace: user.defaultWorkspace,
            skills: user.skills,
        };
        const accessToken = jwt.sign(userObject, process.env.JWT_SECRET, { expiresIn: 60 * 60 });

        res.send({ ...userObject, accessToken });
    } catch (err) {
        next(err);
    }
});

// Sign up
authRouter.post("/signup", async (req, res, next) => {
    try {
        // Hash password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let userDetails = { ...req.body, password: hashedPassword };
        const user = await User.create(userDetails);

        res.status(201).send(user);
    } catch (err) {
        next(err);
    }
});

module.exports = authRouter;

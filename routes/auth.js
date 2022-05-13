var express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Workspace = require("../models/workspace");
const authRouter = express.Router();

// Login
authRouter.post("/login", async (req, res, next) => {
    try {
        // Get user by email
        const user = await User.findOne({ email: req.body.email });

        // Check password
        const passwordCorrect = user === null ? false : await bcrypt.compare(req.body.password, user.password);
        if (!passwordCorrect) return res.status(401).json({ messages: "Invalid email or password" });

        // Get user workspaces
        const workspaces = await Workspace.find({ "members.userId": user.id });

        // If no default set, try to set one of the other workspaces as active on login
        let activeWorkspace;
        if (user.defaultWorkspace === "" || user.defaultWorkspace === null) {
            if (workspaces[0]?._id) activeWorkspace = workspaces[0]._id;
            else activeWorkspace = "";
        } else {
            activeWorkspace = user.defaultWorkspace;
        }

        const userObject = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            activeWorkspace,
            defaultWorkspace: user.defaultWorkspace,
            skills: user.skills,
        };

        const accessToken = jwt.sign(userObject, process.env.JWT_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign(userObject, process.env.REFRESH_SECRET, { expiresIn: "24h" }); // Not used yet

        res.send({ ...userObject, accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
});

// Sign up
authRouter.post("/signup", async (req, res, next) => {
    try {
        // Hash password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        let userDetails = {
            ...req.body,
            password: hashedPassword,
            avatar: { fileKey: "", fileName: "", fileLocation: "" },
            defaultWorkspace: "",
        };
        delete userDetails["repeatPassword"];

        const user = await User.create(userDetails);

        res.status(201).send(user);
    } catch (err) {
        next(err);
    }
});

// Refresh access token
// authRouter.post("/refresh-token", (req, res) => {
//     // Verify refresh token
//     jwt.verify(req.body.refreshToken, process.env.REFRESH_SECRET, (err, payload) => {
//         console.log("valid refresh token");

//         if (!err && payload.id === req.body.id && payload.email === req.body.email) {
//             const newUserObject = {
//                 id: req.body.id,
//                 firstName: req.body.firstName,
//                 lastName: req.body.lastName,
//                 email: req.body.email,
//                 avatar: req.body.avatar,
//                 activeWorkspace: req.body.activeWorkspace,
//                 defaultWorkspace: req.body.defaultWorkspace,
//                 skills: req.body.skills,
//             };

//             const newAccessToken = jwt.sign(newUserObject, process.env.JWT_SECRET, { expiresIn: 10 });

//             return res.status(200).send({ newAccessToken });
//         } else {
//             return res.status(401).send({ messages: "Invalid refresh token" });
//         }
//     });
// });

module.exports = authRouter;

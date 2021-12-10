const db = require("../mongo");
var express = require("express");
const multer = require("multer");
require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Workspace = require("../models/workspace");
const adminCheck = require("../utils/adminCheck");
const usersRouter = express.Router();

// Get all users in a workspace
usersRouter.get("/workspace/:workspaceId", async (req, res, next) => {
    try {
        // Get workspace
        const workspace = await Workspace.findById(req.params.workspaceId);

        const memberIds = workspace.members.map((member) => {
            return member.userId;
        });

        // Get user documents for all workspace members
        const users = await User.find({ _id: { $in: memberIds } });

        res.status(200).send(users);
    } catch (err) {
        next(err);
    }
});

// Get users for IDs given in the request body
usersRouter.post("/group:search", (req, res, next) => {
    const userIdsArray = req.body.group;
    const allRequests = [];

    userIdsArray.forEach((id) => {
        allRequests.push(User.findById(id));
    });

    Promise.all(allRequests)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Get a single user by id
usersRouter.get("/id/:userId", (req, res, next) => {
    User.findById(req.params.userId)
        .then((data) => {
            // Needs ._doc to work"
            delete data._doc.password;
            res.send(data);
        })
        .catch((err) => next(err));
});

// Update user
usersRouter.put("/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.params.userId, req.body, { new: true })
        .then((data) => {
            // Needs ._doc to work"
            delete data._doc.password;
            res.status(200).send(data);
        })
        .catch((err) => next(err));
});

// Delete user (ADMIN ONLY)
// TODO: Has to be improved: see delete in employees.js
usersRouter.delete("/:userId", (req, res, next) => {
    if (!adminCheck(req)) {
        return res.status(403).send({ messages: "Unauthorized user" });
    }

    User.findByIdAndDelete(req.params.userId)
        .then(() => res.status(204).end())
        .catch((err) => next(err));
});

// Create a new user (ADMIN ONLY)
usersRouter.post("/", async (req, res, next) => {
    if (!adminCheck(req)) {
        return res.status(403).send({ messages: "Unauthorized user" });
    }

    try {
        // Hash password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userDocument = { ...req.body, password: hashedPassword };

        const newUser = await User.create(userDocument);
        res.status(201).send(newUser);
    } catch (err) {
        next(err);
    }
});

// Change password
usersRouter.put("/change-password/:userId", async (req, res, next) => {
    try {
        // Get user by id
        const user = await User.findById(req.params.userId);

        // Check password
        const passwordCorrect = user === null ? false : await bcrypt.compare(req.body.currentPassword, user.password);
        if (!passwordCorrect) return res.status(403).json({ messages: "Invalid current password" });

        // Hash the new password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

        await User.findByIdAndUpdate(req.params.userId, {
            $set: { password: hashedPassword },
        });

        res.status(200).json(req.body);
    } catch (err) {
        next(err);
    }

    User.findByIdAndUpdate(req.params.userId, req.body)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Upload avatar image

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFile, deleteFile } = require("../utils/s3");

usersRouter.post("/upload-avatar/:userId", upload.single("image"), async (req, res, next) => {
    let existingAvatarFileKey;
    let existingAvatarFileName;

    // Get existing avatar image data
    try {
        const user = await User.findById(req.params.userId);
        existingAvatarFileKey = user.avatar.fileKey;
        existingAvatarFileName = user.avatar.fileName;
    } catch (error) {
        console.log("Checking existing avatar image data failed");
        console.log(error);
        next(error);
    }

    // Add info of the file to the user in DB.
    try {
        await User.findByIdAndUpdate(req.params.userId, {
            $set: { avatar: { fileKey: req.file.filename, fileName: req.file.originalname } },
        });
    } catch (error) {
        console.log("Adding new avatar to user document failed");
        console.log(error);
        next(error);
    }

    let uploadData;
    // Upload file to s3 bucket.
    try {
        uploadData = await uploadFile(req.file);
        await unlinkFile(req.file.path);
    } catch (error) {
        // If uploading to the bucket fails, rollback the DB update.
        try {
            await Project.findByIdAndUpdate(req.params.projectId, {
                $set: { avatar: { fileKey: existingAvatarFileKey, fileName: existingAvatarFileName } },
            });
        } catch (error) {
            console.log("Uploading image to S3 failed. New avatar image DB data rollback failed");
            console.log(error);
            next(error);
        }

        console.log("Uploading image to S3 failed");
        console.log(error);
        next(error);
    }

    try {
        if (existingAvatarFileKey !== "") {
            await deleteFile(existingAvatarFileKey);
        }
        res.status(200).send({ fileKey: req.file.filename, fileName: req.file.originalname });
    } catch (error) {
        console.log("Deleting previous avatar image from S3 failed");
        console.log(error);
        next(error);
    }
});

// Getting the avatar image from s3 bucket
usersRouter.get("/get-avatar/:fileKey", (req, res) => {
    try {
        const readStream = getFile(req.params.fileKey);
        readStream.pipe(res);
    } catch (err) {
        next(err);
    }
});

// Delete avatar image from  DB and s3 bucket
usersRouter.put("/:userId/delete-avatar", (req, res) => {
    deleteFile(req.params.fileKey)
        .then(() => {
            Project.findByIdAndUpdate(req.params.projectId, { $set: { avatar: { fileKey: "", fileName: "" } } })
                .then(() => res.status(204).end())
                .catch((err) => {
                    console.log(err);
                    res.status(500).send({ messages: "Removing avatar image from DB failed" });
                });
        })
        .catch(() => res.status(500).send({ messages: "Deleting avatar image from file storage failed" }));
});

module.exports = usersRouter;

var express = require("express");
const multer = require("multer");
require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Workspace = require("../models/workspace");
const usersRouter = express.Router();
const helper = require("../utils/helperFunctions");

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
            helper.checkForEmptyResult(data, res);
            // Needs ._doc to work
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

// Delete user
// TODO: Has to be restricted to the user itself. Also has to remove user from workspaces, projects and tasks.
usersRouter.delete("/:userId", (req, res, next) => {});

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
    // Variables used to store previous avatar in case of an error
    let existingAvatarFileKey;
    let existingAvatarFileName;
    let existingAvatarFileLocation;

    // Get existing avatar image info
    try {
        const user = await User.findById(req.params.userId);
        existingAvatarFileKey = user.avatar.fileKey;
        existingAvatarFileName = user.avatar.fileName;
        existingAvatarFileLocation = user.avatar.fileLocation;
    } catch (err) {
        res.status(500).send({ messages: "Failed to et existing avatar image info" });
    }

    let uploadData;
    let uploadedFileInfo;
    try {
        // Upload file to s3 bucket.
        uploadData = await uploadFile(req.file);

        // Remove file from local filesystem
        await unlinkFile(req.file.path);

        uploadedFileInfo = {
            fileKey: uploadData.Key,
            fileName: req.file.originalname,
            fileLocation: uploadData.Location,
        };

        // Update avatar to database
        try {
            await User.findByIdAndUpdate(req.params.userId, {
                $set: {
                    avatar: { ...uploadedFileInfo },
                },
            });
        } catch (err) {
            console.log(err);
            res.status(500).send({ messages: "Adding avatar info to database failed" });
        }
    } catch (error) {
        res.status(500).send({ messages: "File upload failed" });
    }

    // Delete old avatar file
    if (existingAvatarFileKey !== "") {
        await deleteFile(existingAvatarFileKey);
    }

    res.status(200).send(uploadedFileInfo);
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
            User.findByIdAndUpdate(req.params.userId, {
                $set: { avatar: { fileKey: "", fileName: "", fileLocation: "" } },
            })
                .then(() => res.status(204).end())
                .catch(() => res.status(500).send({ messages: "Removing avatar image info from DB failed" }));
        })
        .catch(() => res.status(500).send({ messages: "Deleting avatar image failed" }));
});

module.exports = usersRouter;

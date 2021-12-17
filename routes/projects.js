const db = require("../mongo");
const express = require("express");
const multer = require("multer");

const helper = require("../utils/helperFunctions");
const Project = require("../models/project");
const projectsRouter = express.Router();

// Get all projects from a given workspace
// TODO: Get only past or ongoing projects with a query param
projectsRouter.get("/workspace/:workspaceId", (req, res, next) => {
    Project.find({ workspaceId: req.params.workspaceId })
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Get a project by id
projectsRouter.get("/id/:projectId", (req, res, next) => {
    Project.findById(req.params.projectId)
        .then((data) => {
            helper.checkForEmptyResult(data, res);
            res.send(data);
        })
        .catch((err) => next(err));
});

// Create a new project
projectsRouter.post("/", (req, res, next) => {
    Project.create(req.body)
        .then((data) => res.status(201).send(data))
        .catch((err) => next(err));
});

// Edit a project
projectsRouter.put("/:projectId", (req, res, next) => {
    /* If users have been removed from the project when editing, helper function removes all those employees from task teams as well. */
    let formattedData = helper.removeInvalidUsersFromTasks(req.body);

    // Creates a new object with tasks sorted by status (Not started, Doing, Completed).
    formattedData = { ...formattedData, tasks: helper.sortTasksByStatus(req.body.tasks) };

    Project.findByIdAndUpdate(req.params.projectId, formattedData)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Delete a project by id
projectsRouter.delete("/:projectId", (req, res, next) => {
    Project.findByIdAndDelete(req.params.projectId)
        .then(() => res.status(204).end())
        .catch((err) => next(err));
});

// Get all unique project tags from a given workspace
projectsRouter.get("/tags/:workspaceId", (req, res, next) => {
    Project.find({ workspaceId: req.params.workspaceId })
        .then((data) => {
            let tags = [];
            data.forEach((project) => {
                project.tags.forEach((tag) => {
                    if (!tags.includes(tag)) {
                        tags.push(tag);
                    }
                });
            });
            res.send(tags);
        })
        .catch((err) => next(err));
});

// Uploading file attachments to a project
// TODO: Try to make as transaction to make sure S3 and database are in sync

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFile, deleteFile } = require("../utils/s3");

projectsRouter.post("/:projectId/upload-file", upload.single("file"), (req, res, next) => {
    // Upload file to s3 bucket.
    uploadFile(req.file)
        .then((result) => {
            // Delete file from local filesystem
            unlinkFile(req.file.path);

            // Add info of the file to the project in DB.
            Project.findByIdAndUpdate(req.params.projectId, {
                $push: {
                    files: { fileKey: result.Key, fileName: req.file.originalname, fileLocation: result.Location },
                },
            })
                .then(() =>
                    res.send({
                        fileKey: result.Key,
                        fileLocation: result.Location,
                    })
                )
                .catch(() => res.status(500).send({ messages: "Adding file to project document failed" }));
        })
        .catch((err) => next(err));
});

// Getting an attachment file from s3 bucket
projectsRouter.get("/get-file/:fileKey", (req, res) => {
    const readStream = getFile(req.params.fileKey);
    readStream.pipe(res);
});

// Delete an attachment file from  DB and s3 bucket
// TODO: Try to make as transaction to make sure S3 and database are in sync
projectsRouter.post("/delete-file:search", (req, res) => {
    deleteFile(req.body.fileKey)
        .then(() => {
            Project.findByIdAndUpdate(req.body.projectId, { $pull: { files: { fileKey: req.body.fileKey } } })
                .then(() => res.status(204).end())
                .catch(() => res.status(500).send({ messages: "Failed to delete file from database" }));
        })
        .catch(() => res.status(500).send({ messages: "Failed to delete file" }));
});

// Add comment
projectsRouter.put("/:projectId/add-comment", (req, res, next) => {
    Project.findByIdAndUpdate(req.params.projectId, {
        $push: { comments: req.body },
    })
        .then(() => res.status(200).send())
        .catch((err) => next(err));
});

// Delete comment
projectsRouter.put("/:projectId/delete-comment/:commentId", (req, res, next) => {
    Project.findByIdAndUpdate(req.params.projectId, { $pull: { comments: { _id: req.params.commentId } } })
        .then(() => res.status(200).send())
        .catch((err) => next(err));
});

module.exports = projectsRouter;

const express = require("express");
const multer = require("multer");

const helper = require("../utils/helperFunctions");
const Project = require("../models/project");
const projectsRouter = express.Router();

// Get all projects from a given organization
projectsRouter.get("/org/:organizationId", (req, res, next) => {
    Project.find({ organizationId: req.params.organizationId })
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Get a project by id
projectsRouter.get("/id/:projectId", (req, res, next) => {
    Project.findById(req.params.projectId)
        .then((data) => res.send(data))
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
    /* If employees have been removed from the project when editing, helper function removes all those employees from task teams as well. */
    let formattedData = helper.removeInvalidEmployeesFromTasks(req.body);

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

// Get all unique project tags from a given organization
projectsRouter.get("/tags/:organizationId", (req, res, next) => {
    Project.find({ organizationId: req.params.organizationId })
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

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });
const { uploadFile, getFile, deleteFile } = require("../utils/s3");

projectsRouter.post("/:projectId/upload-file", upload.single("file"), (req, res) => {
    // Add info of the file to the project in DB.
    Project.findByIdAndUpdate(req.params.projectId, {
        $push: { files: { fileKey: req.file.filename, fileName: req.file.originalname } },
    }).catch(() => {
        res.status(500).send({ messages: "Adding file to project document failed" });
    });

    // Upload file to s3 bucket.
    uploadFile(req.file)
        .then((result) => {
            unlinkFile(req.file.path);
            res.send({ filePath: `/projects/get-file/${result.Key}`, fileKey: result.Key });
        })
        .catch((err) => {
            // If uploading to the bucket fails, roll back the DB update.
            Project.findByIdAndUpdate(req.params.projectId, { $pull: { files: { fileKey: req.file.filename } } }).catch(
                (err) => {
                    console.log(err);
                    res.status(500).send("Rollback failed");
                }
            );

            console.log(err);
            res.status(500).send("File upload failed");
        });
});

// Getting an attachment file from s3 bucket
projectsRouter.get("/get-file/:fileKey", (req, res) => {
    const readStream = getFile(req.params.fileKey);
    readStream.pipe(res);
});

// Delete an attachment file from  DB and s3 bucket
projectsRouter.put("/:projectId/delete-file/:fileKey", (req, res, next) => {
    deleteFile(req.params.fileKey)
        .then(() => {
            Project.findByIdAndUpdate(req.params.projectId, { $pull: { files: { fileKey: req.params.fileKey } } })
                .then(() => res.status(204).end())
                .catch((err) => {
                    console.log(err);
                    res.status(500).end();
                });
        })
        .catch((err) => next(err));
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
    Project.findByIdAndUpdate(req.params.projectId, { $pull: { comments: { id: req.params.commentId.toString() } } })
        .then(() => res.status(200).send())
        .catch((err) => next(err));
});

module.exports = projectsRouter;

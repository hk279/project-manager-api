var express = require("express");

const Workspace = require("../models/workspace");
const workspacesRouter = express.Router();

// Get a workspace by id
workspacesRouter.get("/:workspaceId", (req, res, next) => {
    Workspace.findById(req.params.workspaceId)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

// Get all workspaces by user
workspacesRouter.get("/user/:userId", (req, res, next) => {
    Workspace.find({ "members.userId": req.params.userId })
        .then((data) => res.status(200).send(data))
        .catch((err) => next(err));
});

// Create a workspace
workspacesRouter.post("/", (req, res, next) => {
    Workspace.create(req.body)
        .then((data) => res.status(201).send(data))
        .catch((err) => next(err));
});

// Edit a workspace
workspacesRouter.put("/:workspaceId", (req, res, next) => {
    Workspace.findByIdAndUpdate(req.params.workspaceId, req.body)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Delete a workspace
workspacesRouter.delete("/:workspaceId", (req, res, next) => {
    Workspace.findByIdAndDelete(req.params.workspaceId)
        .then(() => res.status(204).end())
        .catch((err) => next(err));
});

module.exports = workspacesRouter;

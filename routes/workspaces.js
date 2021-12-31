const db = require("../mongo");
var express = require("express");

const Workspace = require("../models/workspace");
const Project = require("../models/project");
const User = require("../models/user");
const workspacesRouter = express.Router();

// Get a workspace by id
workspacesRouter.get("/:workspaceId", (req, res, next) => {
    Workspace.findById(req.params.workspaceId)
        .then((data) => res.send(data))
        .catch((err) => next(err));
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
workspacesRouter.delete("/:workspaceId", async (req, res, next) => {
    const session = await db.startSession();
    try {
        // Start session
        await session.startTransaction();

        // Transaction operations
        await Workspace.findByIdAndDelete(req.params.workspaceId).session(session);
        await Project.deleteMany({ workspace: req.params.workspaceId }).session(session);
        await User.updateMany({ defaultWorkspace: req.params.workspaceId }, { defaultWorkspace: "" }).session(session);

        // Finish transaction
        await session.commitTransaction();
        session.endSession();
        return res.send();
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
});

module.exports = workspacesRouter;

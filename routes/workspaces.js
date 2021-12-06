var express = require("express");

const Workspace = require("../models/workspace");
const workspacesRouter = express.Router();

// Get a workspace by id
workspacesRouter.get("/:id", (req, res, next) => {
    Workspace.findById(req.params.id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

// Create a workspace
workspacesRouter.post("/", (req, res, next) => {
    Workspace.create(req.body)
        .then((data) => res.status(201).send(data))
        .catch((err) => next(err));
});

// Edit a workspace
workspacesRouter.put("/:id", (req, res, next) => {
    Workspace.findByIdAndUpdate(req.params.id, req.body)
        .then((data) => res.send(data))
        .catch((err) => next(err));
});

// Delete a workspace
workspacesRouter.delete("/:id", (req, res, next) => {
    // TODO
});

module.exports = workspacesRouter;

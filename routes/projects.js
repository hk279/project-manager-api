var express = require("express");

const helper = require("../utils/helperFunctions");
const Project = require("../models/project");
const projectsRouter = express.Router();

// Get all projects from a given organization
projectsRouter.get("/org/:organizationId", (req, res) => {
    Project.find({ organizationId: req.params.organizationId })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get a project by id
projectsRouter.get("/id/:id", (req, res) => {
    Project.findById(req.params.id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Create a new project
projectsRouter.post("/", (req, res) => {
    Project.create({ ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Edit a project
projectsRouter.put("/", (req, res) => {
    /* If employees have been removed from the project when editing, helper function removes all those employees from task teams as well. */
    let formattedData = helper.removeInvalidEmployeesFromTasks(req.body);

    // Creates a new object with tasks sorted descending alphabetically (Not started, Doing, Completed).
    formattedData = { ...formattedData, tasks: helper.sortTasksByStatus(req.body.tasks) };

    Project.findByIdAndUpdate(req.body.id, formattedData)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Delete a project by id
projectsRouter.delete("/:id", (req, res) => {
    Project.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch((err) => {
            console.log(err);
            res.status(204).end();
        });
});

module.exports = projectsRouter;

var express = require("express");
const helper = require("../utils/helperFunctions");
const Employee = require("../models/employee");
const Project = require("../models/project");

const employeesRouter = express.Router();

// Get all employees from a given organization
employeesRouter.get("/org/:organizationId", async (req, res, next) => {
    Employee.find({ organizationId: req.params.organizationId })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

// Get an employee by id
employeesRouter.get("/id/:id", async (req, res, next) => {
    Employee.findById(req.params.id)
        .then((data) => res.send(data))
        .catch((err) => {
            next(err);
        });
});

// Get employee objects for IDs given in the request body
employeesRouter.post("/employeeGroup", async (req, res, next) => {
    const employeeIdsArray = req.body.group;
    const allRequests = [];

    employeeIdsArray.forEach((id) => {
        allRequests.push(Employee.findById(id));
    });

    Promise.all(allRequests)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

// Create a new employee
employeesRouter.post("/", async (req, res, next) => {
    Employee.create(req.body)
        .then((data) => res.status(201).send(data))
        .catch((err) => {
            next(err);
        });
});

// Update an employee
employeesRouter.put("/:id", async (req, res, next) => {
    Employee.findByIdAndUpdate(req.params.id, req.body)
        .then((data) => res.send(data))
        .catch((err) => {
            next(err);
        });
});

// Delete an employee by id
// TODO: Needs to be a transaction
employeesRouter.delete("/:id", async (req, res, next) => {
    const id = req.params.id;

    // Delete employee
    Employee.findByIdAndDelete(id)
        .then(() => {
            // Find all projects where the employee was involved
            Project.find({ team: id })
                .then((data) => {
                    // Loop through the projects and remove the employee from the project team and every task team
                    const promises = [];
                    data.forEach((project) => {
                        const updatedProject = helper.removeEmployeeFromProject(id, project);
                        promises.push(
                            Project.findByIdAndUpdate(project.id, {
                                $set: { team: updatedProject.team, tasks: updatedProject.tasks },
                            })
                        );
                    });
                    Promise.all(promises)
                        .then(() => res.status(204).end())
                        .catch((err) => {
                            console.log(err);
                            res.status(500).send("Employee deleted. Updating projects failed.");
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send("Employee deleted. Updating projects failed.");
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Delete employee failed");
        });
});

module.exports = employeesRouter;

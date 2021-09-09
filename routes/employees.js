var express = require("express");

const helper = require("../utils/helperFunctions");
const Employee = require("../models/employee");
const employeesRouter = express.Router();

// Get all employees from a given organization
employeesRouter.get("/org/:organization", async (req, res) => {
    Employee.find({ organization: req.params.organization })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get an employee by id
employeesRouter.get("/id/:id", async (req, res) => {
    Employee.findById(req.params.id)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get employee objects for IDs given in the request body
employeesRouter.post("/employeeGroup", async (req, res) => {
    const employeeIdsArray = req.body.group;
    const allRequests = [];

    employeeIdsArray.forEach((id) => {
        allRequests.push(Employee.findById(id));
    });

    Promise.all(allRequests).then((data) => {
        res.send(data);
    });
});

// Create a new employee
employeesRouter.post("/", async (req, res) => {
    Employee.create({ ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Edit an employee
employeesRouter.put("/", async (req, res) => {
    Employee.findByIdAndUpdate(req.body.id, req.body)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Delete an employee by id
employeesRouter.delete("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await Employee.findByIdAndDelete(id);
        /* Gets the projects where the deleted employee was involved in */
        const affectedProjects = await Project.find({ team: id });

        /* Updates all affected projects, so that the employee is removed from it's team and tasks */

        affectedProjects.forEach((project) => {
            const updatedProject = helper.removeEmployeeFromProject(id, project);

            // Can't explain why this needs $set and .exec() while other findByIdAndUpdate() calls don't
            Project.findByIdAndUpdate(project.id, {
                $set: { team: updatedProject.team, tasks: updatedProject.tasks },
            }).exec();
        });

        res.status(204).end();
    } catch (err) {
        console.log(err);
        res.status(204).end();
    }
});

module.exports = employeesRouter;

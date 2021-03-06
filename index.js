require("./mongo");
const User = require("./models/user");
const Project = require("./models/project");
const Employee = require("./models/employee");

const helper = require("./utils/helperFunctions");

const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

// Get a user with given login info
app.post("/auth/login", (req, res) => {
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get all projects from a given organization
app.get("/api/projects/org/:organization", (req, res) => {
    Project.find({ organization: req.params.organization })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get a project by id
app.get("/api/projects/id/:id", (req, res) => {
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
app.post("/api/projects", (req, res) => {
    Project.create({ ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Edit a project
app.put("/api/projects", (req, res) => {
    // Creates a new object with tasks sorted descending alphabetically (Not started, Doing, Completed).
    const updatedData = { ...req.body, tasks: helper.sortTasksByStatus(req.body.tasks) };

    Project.findByIdAndUpdate(req.body.id, updatedData)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Delete a project by id
app.delete("/api/projects/id/:id", (req, res) => {
    Project.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch((err) => {
            console.log(err);
            res.status(204).end();
        });
});

// Get all employees from a given organization
app.get("/api/employees/org/:organization", async (req, res) => {
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
app.get("/api/employees/id/:id", async (req, res) => {
    Employee.findById(req.params.id)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Create a new employee
app.post("/api/employees", async (req, res) => {
    Employee.create({ ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get employee objects for IDs given in the request body
app.post("/api/employeeGroup", async (req, res) => {
    const employeeIdsArray = req.body.group;
    const allRequests = [];

    employeeIdsArray.forEach((id) => {
        allRequests.push(Employee.findById(id));
    });

    Promise.all(allRequests).then((data) => {
        res.send(data);
    });
});

// Edit an employee
app.put("/api/employees", async (req, res) => {
    /* If employees have been removed from the project when editing, helper function removes all those employees from task teams as well. */
    const formattedData = helper.removeInvalidEmployeesFromTasks(req.body);
    console.log(formattedData);

    Employee.findByIdAndUpdate(req.body.id, formattedData)
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Delete an employee by id
app.delete("/api/employees/:id", async (req, res) => {
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

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

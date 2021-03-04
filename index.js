require("./mongo");
const User = require("./models/user");
const Project = require("./models/project");
const Employee = require("./models/employee");

const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());

// Get a user with given login info
app.post("/auth/login", (req, res) => {
    User.findOne({ email: req.body.email, password: req.body.password })
        .then((data) => {
            console.log(data);
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
            console.log(data);
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
    Project.findByIdAndUpdate(req.body.id, { ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Get all employees from a given organization
app.get("/api/employees/:organization", async (req, res) => {
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
app.get("/api/employees/:id", async (req, res) => {
    Employee.findOne({ id: req.params.id })
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
        console.log(data);
        res.send(data);
    });
});

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

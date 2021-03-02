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

// Get a project by id
app.get("/api/projects/:id", (req, res) => {
    Project.findOne({ id: req.params.id })
        .then((data) => res.send(data))
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

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

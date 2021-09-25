require("./mongo");

const usersRouter = require("./routes/users");
const employeesRouter = require("./routes/employees");
const projectsRouter = require("./routes/projects");
const organizationsRouter = require("./routes/organizations");

const errorHandler = require("./errorHandler");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/organizations", organizationsRouter);
app.use("/employees", employeesRouter);
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use(errorHandler);

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

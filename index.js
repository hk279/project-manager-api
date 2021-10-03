require("./mongo");

const usersRouter = require("./routes/users");
const employeesRouter = require("./routes/employees");
const projectsRouter = require("./routes/projects");
const organizationsRouter = require("./routes/organizations");

const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./utils/errorHandler");
const authenticator = require("./utils/authenticator"); // JWT testing

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(authenticator); // JWT testing
app.use("/organizations", organizationsRouter);
app.use("/employees", employeesRouter);
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use(errorHandler);

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

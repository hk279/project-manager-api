require("./mongo");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const employeesRouter = require("./routes/employees");
const projectsRouter = require("./routes/projects");
const organizationsRouter = require("./routes/organizations");

const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./utils/errorHandler");
const authenticator = require("./utils/authenticator");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/organizations", authenticator, organizationsRouter);
app.use("/employees", authenticator, employeesRouter);
app.use("/projects", authenticator, projectsRouter);
app.use("/users", authenticator, usersRouter);
app.use(errorHandler);

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

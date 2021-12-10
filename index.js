require("./mongo");

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");
const workspacesRouter = require("./routes/workspaces");

const cors = require("cors");
const express = require("express");
const errorHandler = require("./utils/errorHandler");
const authenticator = require("./utils/authenticator");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/workspaces", authenticator, workspacesRouter);
app.use("/projects", authenticator, projectsRouter);
app.use("/users", authenticator, usersRouter);
app.use(errorHandler);

const port = 3001;
app.listen(port, () => console.log("App listening in port " + port));

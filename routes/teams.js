var express = require("express");

const Team = require("../models/team");
const teamsRouter = express.Router();

// Get all teams
teamsRouter.get("/org/:organizationId", (req, res) => {
    Team.find({ organizationId: req.params.organizationId })
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Create a team
teamsRouter.post("/", (req, res) => {
    Team.create({ ...req.body })
        .then((data) => res.send(data))
        .catch((err) => {
            console.log(err);
            res.status(500).send();
        });
});

// Update a team
teamsRouter.put("/", (req, res) => {});

module.exports = teamsRouter;

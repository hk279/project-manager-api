var express = require("express");

const Organization = require("../models/organization");
const organizationsRouter = express.Router();

// Get an organization by id
organizationsRouter.get("/:id", (req, res, next) => {
    Organization.findById(req.params.id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = organizationsRouter;

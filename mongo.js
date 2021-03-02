const mongoose = require("mongoose");
require("dotenv").config();

// Establish MongoDB connection
const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
    });

const mongoose = require("mongoose");
require("dotenv").config();

// Establish MongoDB connection
const url = process.env.MONGODB_URI;

console.log("connecting to", url);
mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log("connected to MongoDB");
    });

var db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

module.exports = db;

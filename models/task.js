const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    estimatedCompletion: {
        type: Date,
        required: true,
    },
    assignedTo: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: true,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
taskSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = taskSchema;

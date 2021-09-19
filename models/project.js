const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    deadline: {
        type: String,
        required: false,
    },
    organizationId: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    team: {
        type: [String],
        required: true,
    },
    files: {
        type: Array,
        required: true,
    },
    tasks: {
        type: Array,
        required: true,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
projectSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Project", projectSchema);

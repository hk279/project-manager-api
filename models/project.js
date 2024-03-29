const mongoose = require("mongoose");
const taskSchema = require("./task");
const commentSchema = require("./comment");
const validator = require("../utils/validator");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidProjectType,
            message: (props) => `${props.value} is not a valid project type`,
        },
    },
    client: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    deadline: {
        type: Date,
        default: null,
    },
    workspaceId: {
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
        type: [taskSchema],
        required: true,
    },
    comments: {
        type: [commentSchema],
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

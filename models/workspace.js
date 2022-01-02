const mongoose = require("mongoose");
const validator = require("../utils/validator");

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidWorkspaceType,
            message: (props) => `${props.value} is not a valid workspace type`,
        },
    },
    owner: {
        type: String,
        required: true,
    },
    members: {
        type: Object,
        required: true,
    },
    inviteLinkId: {
        type: String,
        required: true,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
workspaceSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Workspace", workspaceSchema);

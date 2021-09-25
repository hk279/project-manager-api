const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        minlength: 5,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
    },
    organizationId: {
        type: String,
        required: true,
    },
    // Admin or normal
    userType: {
        type: String,
        required: true,
    },
    // Private or organization
    userOrganizationType: {
        type: String,
        required: true,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("User", userSchema);

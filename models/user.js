const mongoose = require("mongoose");
const validator = require("../utils/validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidName,
            message: (props) => `${props.value} is not a valid name`,
        },
    },
    lastName: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidName,
            message: (props) => `${props.value} is not a valid name`,
        },
    },
    email: {
        type: String,
        minlength: 5,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: (props) => `${props.value} is not a valid email`,
        },
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
    },
    phone: {
        type: String,
        minlength: 5,
        required: false,
    },
    avatar: {
        type: Object,
        required: false,
    },
    skills: {
        type: [String],
        required: true,
    },
    defaultWorkspace: {
        type: String,
        required: false,
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

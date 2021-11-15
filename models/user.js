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
    userType: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidUserType,
            message: (props) => `${props.value} is not a valid user type`,
        },
    },
    userOrganizationType: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidOrganizationType,
            message: (props) => `${props.value} is not a valid organization type`,
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
    organizationId: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        minlength: 5,
        required: true,
    },
    phone: {
        type: Number,
        minlength: 5,
        required: false,
        unique: true,
    },
    avatar: {
        type: Object,
        required: false,
    },
    department: {
        type: String,
        required: false,
    },
    skills: {
        type: [String],
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

const mongoose = require("mongoose");
const validator = require("../utils/validator");

const employeeSchema = new mongoose.Schema({
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
    organizationId: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    skills: {
        type: [String],
        required: false,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
employeeSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Employee", employeeSchema);

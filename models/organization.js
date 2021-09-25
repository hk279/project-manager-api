const mongoose = require("mongoose");
const validator = require("../utils/validator");

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: validator.isValidOrganizationType,
            message: (props) => `${props.value} is not a valid organization type`,
        },
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
organizationSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Organization", organizationSchema);

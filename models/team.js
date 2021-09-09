const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
    },
    members: {
        type: Array,
        required: true,
    },
    organization: {
        type: String,
        required: true,
    },
});

teamSchema.plugin(uniqueValidator);

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Team", teamSchema);

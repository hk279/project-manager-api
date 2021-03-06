const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Schema with validation rules.
const userSchema = new mongoose.Schema({
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
        unique: true,
    },
    organization: {
        type: String,
        required: true,
    },
});

userSchema.plugin(uniqueValidator);

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
userSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("User", userSchema);

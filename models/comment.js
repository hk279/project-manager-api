const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    authorId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: String,
        required: true,
    },
});

// Format the returned data. Remove _id-object and return a string id instead. Also remove the MongoDB version.
commentSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = commentSchema;

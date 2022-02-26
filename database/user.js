const mongoose = require("mongoose");

const schema = mongoose.Schema({
    id: {type: String},
    name: {type: String},
    files: [{name: String, content: String}, {name: String, content: String}, {name: String, content: String}, {name: String, content: String}, {name: String, content: String}]
})

module.exports = mongoose.model("user", schema)
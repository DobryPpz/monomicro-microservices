const mongoose = require("mongoose");

const User = new mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        password: String,
        level: Number
    })
);

module.exports = User;
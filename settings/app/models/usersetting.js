const mongoose = require("mongoose");

const UserSetting = new mongoose.model(
    "UserSetting",
    new mongoose.Schema({
        username: String,
        skincolor: String,
        bulletcolor: String,
        deathsound: String,
        shootsound: String
    })
);

module.exports = UserSetting;
const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");

router.get("/", (req,res) => {
    axios.post(`${process.env.USERS_IP}/verify`,req.body,{headers: req.headers})
    .then(response => {
        return res.sendFile(path.join(__dirname,"..","views","settingspage.html"));
    })
    .catch(err => {
        return res.end("No access");
    });
});

router.post("/save", (req,res) => {
    axios.post(`${process.env.SETTINGS_IP}/save`,req.body,{headers: req.headers})
    .then(response => {
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;
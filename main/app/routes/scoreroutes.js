const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");

router.get("/", async (req,res) => {
    axios.post(`${process.env.USERS_IP}/verify`,req.body,{headers: req.headers})
    .then(response => {
        console.log("score routes point 1");
        return res.sendFile(path.join(__dirname,"..","views","playerscorepage.html"));
    })
    .catch(err => {
        console.log("score routes point 2",err);
        return res.end("No access");
    });
});

router.get("/decreasing", async (req,res) => {
    axios.get(`${process.env.USERS_IP}/decreasing`,{headers: req.headers})
    .then(response => {
        console.log(response.data);
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});

router.get("/increasing",async (req,res) => {
    axios.get(`${process.env.USERS_IP}/increasing`,{headers: req.headers})
    .then(response => {
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});

router.get("/player", async (req,res) => {
    axios.get(`${process.env.USERS_IP}/player`,{headers: req.headers})
    .then(response => {
        return res.send(response.data).end();
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;
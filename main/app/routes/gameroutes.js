const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/",(req,res) => {
    axios.post(`${process.env.GAME_IP}/game`,req.body,{headers: req.headers})
    .then(response => {
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/signup",(req,res) => {
    axios.post(`${process.env.USERS_IP}/signup`,req.body,{headers: req.headers})
    .then(response => {
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});
router.post("/signin",(req,res) => {
    axios.post(`${process.env.USERS_IP}/signin`,req.body,{headers: req.headers})
    .then(response => {
        return res.end(JSON.stringify(response.data));
    })
    .catch(err => {
        console.log(err);
    });
});

module.exports = router;
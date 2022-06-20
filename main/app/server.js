const path = require("path");
require("dotenv").config({
    path: path.join(__dirname,".env")
});
const express = require("express");
const app = express();
const server = app.listen(+process.env.MAIN_IP.split(":").slice(-1)[0]);
const cors = require("cors");
const authRoutes = require("./routes/authroutes");
const scoreRoutes = require("./routes/scoreroutes");
const settingsRoutes = require("./routes/settingsroutes");
const gameRoutes = require("./routes/gameroutes");
const axios = require("axios");

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"..","grafika")));
app.use(express.static(path.join(__dirname,"views","scripts")));
app.use(express.static(path.join(__dirname,"styles")));
app.use(express.static(path.join(__dirname,"deathsounds")));
app.use(express.static(path.join(__dirname,"shootsounds")));

app.get("/",(req,res) => {
    res.sendFile(path.join(__dirname,"views","startpage.html"));
});
app.get("/menu",(req,res) => {
    axios.post(`${process.env.USERS_IP}/verify`,req.body,{headers: req.headers})
    .then(response => {
        console.log("main -> app -> server OK :: response status",response.status);
        if(response.status == 200) return res.sendFile(path.join(__dirname,"views","menupage.html"));
        else return res.end("No access");
    })
    .catch(err => {
        return res.end("No access");
    });
});
app.use("/auth",authRoutes);
app.use("/game",gameRoutes);
app.use("/score",scoreRoutes);
app.use("/settings",settingsRoutes);
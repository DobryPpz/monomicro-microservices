const path = require("path");
require("dotenv").config({
    path: path.join(__dirname,".env")
});
const db = require("./models/index");
const express = require("express");
const app = express();
console.log(+process.env.SETTINGS_IP.split(":").slice(-1)[0]);
const server = app.listen(+process.env.SETTINGS_IP.split(":").slice(-1)[0]);
const axios = require("axios");
const Setting = require("./models/usersetting");

app.use(express.urlencoded({extended: false}));
app.use(express.json());

db.mongoose.connect(process.env.DB_IP,() => {
    console.log(`connected to a database on address ${process.env.DB_IP}`);
});

app.post("/create", async (req,res) => {
    console.log("rozpoczynamy tworzenie ustawienia",req.body);
    const s = await Setting.findOne({username: req.body["username"]});
    if(s){
        console.log("Ustawienie dla tego użytownika już istnieje");
        return res.send("Ustawienie dla tego użytownika już istnieje");
    }
    else{
        const newS = new Setting({
            username: req.body["username"],
            skincolor: "#FFFFFF",
            bulletcolor: "#FFFFFF",
            deathsound: "deathsounddefault.wav",
            shootsound: "shootsounddefault.wav"
        });
        console.log("stworzono ustawienie");
        await newS.save();
        return res.status(200).send({message: "stworzono nowe ustawienie"});
    }
});

app.post("/save", async (req,res) => {
    const Setting = require("./models/usersetting");
    axios.post(`${process.env.USERS_IP}/verify`,req.body,{headers: req.headers})
    .then(async response => {
        console.log("here we are",response.data);
        const username = response.data["username"];
        const s = await Setting.findOne({username: username});
        console.log(username);
        console.log(s);
        if(s){
            s["skincolor"] = req.body["newskincolor"];
            s["bulletcolor"] = req.body["newbulletcolor"];
            s["deathsound"] = req.body["newdeathsound"];
            s["shootsound"] = req.body["newshootsound"];
            console.log(s);
            await s.save();
            return res.status(200).send({message: "Zmieniono ustawienia"});
        }
        else{
            return res.send({message: "Ustawienie dla tego użytkownika nie istnieje"});
        }
    })
    .catch(err => {
        return res.end("No access");
    });
});

app.post("/player", async (req,res) => {
    if(req.headers["token"] == process.env.SECRET_GET_PLAYER){
        const username = req.body["username"];
        const s = await Setting.findOne({username: username});
        if(s){
            const ret = {
                username: s["username"],
                skincolor: s["skincolor"],
                bulletcolor: s["bulletcolor"],
                shootsound: s["shootsound"],
                deathsound: s["deathsound"]
            };
            return res.end(JSON.stringify(ret));
        }
        else{
            return res.end(JSON.stringify({message: "Ustawienie dla tego użytkownika nie istnieje"}));
        }
    }
    else{
        return res.end("No access");
    }
});















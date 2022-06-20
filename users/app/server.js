const path = require("path");
require("dotenv").config({
    path: path.join(__dirname,".env")
});
const db = require("./models/index");
const express = require("express");
const app = express();
const server = app.listen(+process.env.USERS_IP.split(":").slice(-1)[0]);
const cors = require("cors");
const User = db.user;
const bcrypt = require("bcrypt");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { nextTick } = require("process");

app.use(express.urlencoded({extended: false}));
app.use(express.json());

db.mongoose.connect(process.env.DB_IP,() => {
    console.log(`connected to a database on address ${process.env.DB_IP}`);
});

const genToken = u => {
    const obj = {
        "username": u.username,
        "password": u.password,
        "level": u.level
    };
    const accessToken = jwt.sign(obj,process.env.ACCESS_TOKEN_SECRET);
    return accessToken;
}

const verifyToken = async (req,res,isLocal=false) => {
    const header = req.headers["x-access-token"];
    let u;
    if(header !== undefined){
        console.log(header);
        jwt.verify(header,process.env.ACCESS_TOKEN_SECRET,(err,user) => {
            if(err){
                console.log(header);
                console.log(err);
                if(isLocal) return false;
                return res.status(400).send({message: "You don't have access"}).end();   
            }
            console.log("verify token point 1",user,isLocal);
            if(isLocal == true){
                u = user;
                return;
            };
            console.log("verify token point 2");
            return res.status(200).end(JSON.stringify(user));
        });
        return u;
    }
    else{
        return res.status(400).send({message: "Unauthorized!"}).end();
    }
}

app.post("/verify",verifyToken);

app.post("/signup", async (req,res) => {
    const u = await User.findOne({username: req.body.username});
    console.log(req.body);
    if(u){
        return res.end(JSON.stringify({message: "Użytkownik o takiej nazwie już istnieje"}));
    }
    else{
        const hashedPassword = await bcrypt.hash(req.body.password,8);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            level: 1,
        });
        await user.save();
        console.log("user created");
        axios.post(`${process.env.SETTINGS_IP}/create`,{
            "username": req.body.username
        })
        .then(response => {
            console.log("point 2",user);
            return res.end(JSON.stringify({message: "Zarejestrowano pomyślnie"}));
        })
        .catch(err => {
            console.log("setting creating error");
            return res.end("setting creating error");
        });
    }
});

app.post("/signin", async (req,res) => {
    const u = await User.findOne({username: req.body.username});
    console.log(u);
    if(u){
        console.log("/signin point 1");
        const isPasswordGood = bcrypt.compareSync(req.body.password,u.password);
        if(isPasswordGood){
            console.log("/signin point 2");
            return res.status(200).end(JSON.stringify({
                "x-access-token" : genToken(u)
            }));
        }
        else{
            console.log("/signin point 3");
            return res.end(JSON.stringify({message: "Złe hasło"}));
        }
    }
    else{
        console.log("/signin point 4");
        return res.end(JSON.stringify({message: "Nie ma użytkownika o takiej nazwie"}));
    }
});

app.get("/decreasing", async (req,res) => {
    const v = await verifyToken(req,res,true);
    console.log("decreasing point 1",v);
    if(v){
        console.log("decreasing point 2");
        let users = await User.find({});
        users.sort((a,b) => b["level"]-a["level"]);
        users = users.slice(0,10);
        users = users.map(u => {
            return {
                "username": u["username"],
                "level": u["level"]
            };
        });
        console.log("decreasing point 3");
        return res.end(JSON.stringify(users));
    }
    else{
        console.log("decreasing point 4");
        return res.end("No access");
    }
});

app.get("/increasing",async (req,res) => {
    const v = await verifyToken(req,res,true);
    if(v){
        let users = await User.find({});
        users.sort((a,b) => a["level"]-b["level"]);
        users = users.slice(0,10);
        users = users.map(u => {
            return {
                "username": u["username"],
                "level": u["level"]
            };
        });
        return res.end(JSON.stringify(users));
    }
    else{
        return res.end("No access");
    }
});

app.get("/player", async (req,res) => {
    const v = await verifyToken(req,res,true);
    if(v){
        let users = await User.find({});
        users.sort((a,b) => b["level"]-a["level"]);
        let player = v;
        for(let i=0;i<users.length;i++){
            if(users[i]["username"] == player["username"]){
                return res.end(JSON.stringify({
                    "username": player["username"],
                    "rank": i+1
                }));
            }
        }
    }
    else{
        return res.end("No access");
    }
});












const cors = require("cors");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname,".env")
});
const axios = require("axios");
const express = require("express");
const app = express();
app.use(cors({
    origin: "*"
}));
const server = app.listen(+process.env.GAME_IP.split(":").slice(-1)[0]);
const uniqid = require("uniqid");
const rooms = {};
const queue = {};
const io = require("socket.io")(server,{
    cors: {
        origin: "*",
        methods: ["GET","POST"]
    }
});
app.use(express.urlencoded({extended: false}));
app.use(express.json());

class Room{
    constructor(player1,player2,code){
        this.player1 = player1;
        this.player2 = player2;
        this.code = code;
        this.bullets1 = [];
        this.bullets2 = [];
        this.hpAdders = [];
        this.armorAdders = [];
        this.intervalid = undefined;
        this.spawnAddersId = undefined;
        this.numberOfPlayers = 2;
        this.sendUpdateEvent();
    }
    closeRoom = () => {
        clearInterval(this.intervalid);
        clearInterval(this.spawnAddersId);
        io.to(this.player1.socketid).emit("end-game", this.code);
        io.to(this.player2.socketid).emit("end-game", this.code);
        delete rooms[this.code];
    }
    declareWinner = async (player) => {
        const u = await User.findOne({username: player});
        u["level"]++;
        await u.save();
    }
    declareLoser = async (player) => {
        const u = await User.findOne({username: player});
        if(u["level"] > 1){
            u["level"]--;
        }
        await u.save();
    }
    playerMoveEvent = (data) => {
        if(data["username"] == this.player1["username"]){
            this.player1.x = data["x"];
            this.player1.y = data["y"];
        }
        if(data["username"] == this.player2["username"]){
            this.player2.x = data["x"];
            this.player2.y = data["y"];
        }
        this.sendUpdateEvent();
    }
    playerFireEvent = (data) => {
        if(data["username"] == this.player1["username"]){
            this.bullets1.push(data["bullet"]);
        }
        if(data["username"] == this.player2["username"]){
            this.bullets2.push(data["bullet"]);
        }
        this.sendUpdateEvent();
    }
    spawnAdder = async () => {
        if(Math.random()<0.5){
            this.hpAdders.push({
                x: 20+Math.floor(Math.random()*600),
                y: 20+Math.floor(Math.random()*500),
                dx: -5+Math.floor(Math.random()*10),
                dy: -5+Math.floor(Math.random()*10) 
            });
        }
        else{
            this.armorAdders.push({
                x: 20+Math.floor(Math.random()*600),
                y: 20+Math.floor(Math.random()*500),
                dx: -5+Math.floor(Math.random()*10),
                dy: -5+Math.floor(Math.random()*10) 
            });
        }
        this.sendUpdateEvent();
    }
    sendUpdateEvent = () => {
        io.to(this.player1["socketid"]).emit("update",{
            "player1": {
                "x": this.player1.x,
                "y": this.player1.y,
                "hp": this.player1.hp,
                "armor": this.player1.armor,
                "username": this.player1.username,
                "skincolor": this.player1.skincolor,
                "bulletcolor": this.player1.bulletcolor,
                "shootsound": this.player1.shootsound,
                "deathsound": this.player1.deathsound,
                "rotation": this.player1.rotation
            },
            "player2": {
                "x": this.player2.x,
                "y": this.player2.y,
                "hp": this.player2.hp,
                "armor": this.player2.armor,
                "username": this.player2.username,
                "skincolor": this.player2.skincolor,
                "bulletcolor": this.player2.bulletcolor,
                "shootsound": this.player2.shootsound,
                "deathsound": this.player2.deathsound,
                "rotation": this.player2.rotation
            },
            "code": this.code,
            "bullets1": this.bullets1,
            "bullets2": this.bullets2,
            "hpAdders": this.hpAdders,
            "armorAdders": this.armorAdders
        });
        io.to(this.player2["socketid"]).emit("update",{
            "player1": {
                "x": this.player1.x,
                "y": this.player1.y,
                "hp": this.player1.hp,
                "armor": this.player1.armor,
                "username": this.player1.username,
                "skincolor": this.player1.skincolor,
                "bulletcolor": this.player1.bulletcolor,
                "shootsound": this.player1.shootsound,
                "deathsound": this.player1.deathsound,
                "rotation": this.player1.rotation
            },
            "player2": {
                "x": this.player2.x,
                "y": this.player2.y,
                "hp": this.player2.hp,
                "armor": this.player2.armor,
                "username": this.player2.username,
                "skincolor": this.player2.skincolor,
                "bulletcolor": this.player2.bulletcolor,
                "shootsound": this.player2.shootsound,
                "deathsound": this.player2.deathsound,
                "rotation": this.player2.rotation
            },
            "code": this.code,
            "bullets1": this.bullets1,
            "bullets2": this.bullets2,
            "hpAdders": this.hpAdders,
            "armorAdders": this.armorAdders
        });
    }
    update = async () => {
        for(let b of this.bullets1){
            b.x += b.dx;
            b.y += b.dy;
            this.sendUpdateEvent();
        }
        for(let b of this.bullets2){
            b.x += b.dx;
            b.y += b.dy;
            this.sendUpdateEvent();
        }
        for(let h of this.hpAdders){
            if(Math.sqrt((h.x-this.player1.x)**2+(h.y-this.player1.y)**2) <= 40){
                this.player1.hp = Math.min(this.player1.hp+40,500);
                this.hpAdders.splice(this.hpAdders.indexOf(h),1);
                this.sendUpdateEvent();
            }
            if(Math.sqrt((h.x-this.player2.x)**2+(h.y-this.player2.y)**2) <= 40){
                this.player2.hp = Math.min(this.player2.hp+40,500);
                this.hpAdders.splice(this.hpAdders.indexOf(h),1);
                this.sendUpdateEvent();
            }
            if(h.x <= 0){
                h.dx *= -1;
                this.sendUpdateEvent();
            }
            if(h.x >= 800){
                h.dx *= -1;
                this.sendUpdateEvent();
            }
            if(h.y <= 0){
                h.dy *= -1;
                this.sendUpdateEvent();
            }
            if(h.y >= 600){
                h.dy *= -1;
                this.sendUpdateEvent();
            }
        }
        for(let a of this.armorAdders){
            if(Math.sqrt((a.x-this.player1.x)**2+(a.y-this.player1.y)**2) <= 20){
                this.player1.armor = Math.min(this.player1.armor+20,100);
                this.armorAdders.splice(this.armorAdders.indexOf(a),1);
                this.sendUpdateEvent();
            }
            if(Math.sqrt((a.x-this.player2.x)**2+(a.y-this.player2.y)**2) <= 20){
                this.player2.armor = Math.min(this.player2.armor+20,100);
                this.armorAdders.splice(this.armorAdders.indexOf(a),1);
                this.sendUpdateEvent();
            }
            if(a.x <= 0){
                a.dx *= -1;
                this.sendUpdateEvent();
            }
            if(a.x >= 800){
                a.dx *= -1;
                this.sendUpdateEvent();
            }
            if(a.y <= 0){
                a.dy *= -1;
                this.sendUpdateEvent();
            }
            if(a.y >= 600){
                a.dy *= -1;
                this.sendUpdateEvent();
            }
        }
        for(let b of this.bullets1){
            if(Math.sqrt((b.x-this.player2.x)**2+(b.y-this.player2.y)**2) <= 20){
                this.bullets1.splice(this.bullets1.indexOf(b),1);
                if(this.player2.armor >= 10){
                    this.player2.armor -= 10;
                    this.player2.hp -= 10;
                }
                else{
                    this.player2.hp -= (20-this.player2.armor);
                    this.player2.armor = 0;
                }
                this.sendUpdateEvent();
                if(this.player2.hp <= 0){
                    await this.declareWinner(this.player1["username"]);
                    await this.declareLoser(this.player2["username"]);
                    this.closeRoom();
                }
            }
            if(b.x <= 0 || b.x >= 800 || b.y <= 0 || b.y >= 600){
                this.bullets1.splice(this.bullets1.indexOf(b),1);
                this.sendUpdateEvent();
            }
        }
        for(let b of this.bullets2){
            if(Math.sqrt((b.x-this.player1.x)**2+(b.y-this.player1.y)**2) <= 20){
                this.bullets2.splice(this.bullets2.indexOf(b),1);
                if(this.player1.armor >= 10){
                    this.player1.armor -= 10;
                    this.player1.hp -= 10;
                }
                else{
                    this.player1.hp -= (20-this.player1.armor);
                    this.player1.armor = 0;
                }
                this.sendUpdateEvent();
                if(this.player1.hp <= 0){
                    await this.declareWinner(this.player2["username"]);
                    await this.declareLoser(this.player1["username"]);
                    this.closeRoom();
                }
            }
            if(b.x <= 0 || b.x >= 800 || b.y <= 0 || b.y >= 600){
                this.bullets2.splice(this.bullets2.indexOf(b),1);
                this.sendUpdateEvent();
            }
        }
    }
}

class Player{
    constructor(hp,armor,x,y,username,skincolor,bulletcolor,shootsound,deathsound,socketid){
        this.hp = hp;
        this.armor = armor;
        this.x = x;
        this.y = y;
        this.username = username;
        this.skincolor = skincolor;
        this.bulletcolor = bulletcolor;
        this.shootsound = shootsound;
        this.deathsound = deathsound;
        this.socketid = socketid;
        this.rotation = 0;
    }
}

io.on("connection", socket => {
    console.log("someone connected with id",socket.id);
    socket.on("player-fire", data => {
        if(rooms[data["code"]]) rooms[data["code"]].playerFireEvent(data);
    });
    socket.on("player-move", data => {
        if(rooms[data["code"]]) rooms[data["code"]].playerMoveEvent(data);
    });
    socket.on("join-room", data => {
        socket.join(data);
    });
    socket.on("leave-room", data => {
        console.log("leave-room acquired");
        if(rooms[data]) rooms[data].numberOfPlayers--;
        if(rooms[data] && rooms[data].numberOfPlayers == 0){
            rooms[data].closeRoom();
        }
        socket.leave(data);
    });
    socket.on("hello",data => {
        io.emit("hi");
    });
    socket.on("disconnect", () => {
        for(r in rooms){
            if(rooms[r].player1.socketid == socket.id || rooms[r].player2.socketid == socket.id){
                rooms[r].closeRoom();
            }
        }
    });
});

const getIo = () => {
    return io;
}

const createRoom = async (player1,player2) => {
    const roomId = uniqid();
    const player1socket = player1["socketid"];
    const player2socket = player2["socketid"];
    await axios.post(`${process.env.SETTINGS_IP}/player`,{"username":player1["username"]},{
        headers: {
            "token": process.env.SECRET_GET_PLAYER
        }
    })
    .then(response => {
        player1["username"] = response.data["username"];
        player1["skincolor"] = response.data["skincolor"];
        player1["bulletcolor"] = response.data["bulletcolor"];
        player1["shootsound"] = response.data["shootsound"];
        player1["deathsound"] = response.data["deathsound"];
    })
    .catch(err => {
        return err;
    });
    await axios.post(`${process.env.SETTINGS_IP}/player`,{"username":player2["username"]},{
        headers: {
            "token": process.env.SECRET_GET_PLAYER
        }
    })
    .then(response => {
        player2["username"] = response.data["username"];
        player2["skincolor"] = response.data["skincolor"];
        player2["bulletcolor"] = response.data["bulletcolor"];
        player2["shootsound"] = response.data["shootsound"];
        player2["deathsound"] = response.data["deathsound"];
    })
    .catch(err => {
        return err;
    });
    const roomPlayer1 = new Player(500,
        100,
        20+Math.floor(Math.random()*600),
        20+Math.floor(Math.random()*500),
        player1["username"],
        player1["skincolor"],
        player1["bulletcolor"],
        player1["shootsound"],
        player1["deathsound"],
        player1socket);
    const roomPlayer2 = new Player(500,
        100,
        20+Math.floor(Math.random()*600),
        20+Math.floor(Math.random()*500),
        player2["username"],
        player2["skincolor"],
        player2["bulletcolor"],
        player2["shootsound"],
        player2["deathsound"],
        player2socket);
    const gameRoom = new Room(roomPlayer1,roomPlayer2,roomId);
    const interval = setInterval(gameRoom.update,0);
    const spawnInterval = setInterval(gameRoom.spawnAdder,10000);
    gameRoom.intervalid = interval;
    gameRoom.spawnAddersId = spawnInterval;
    rooms[roomId] = gameRoom;
    io.to(player1socket).emit("room-ready",roomId);
    io.to(player2socket).emit("room-ready",roomId);
    console.log("room created");
}

const findPair = () => {
    for(let q in queue){
        if(queue[q].length >= 2){
            let pair = queue[q].splice(0,2);
            if(pair[0]["username"] != pair[1]["username"]){
                createRoom(pair[0],pair[1]);
            }
        }
    }
}

app.post("/game",async (req,res) => {
    axios.post(`${process.env.USERS_IP}/verify`,req.body,{headers: req.headers})
    .then(async response => {
        const u = response.data;
        console.log(u);
        console.log("game point 1");
        if(!queue.hasOwnProperty(u["level"])){
            queue[u["level"]] = [];
        }
        let obj = {
            "username": u["username"],
            "level": u["level"],
            "socketid": req.body["socketid"]
        };
        queue[u["level"]].push(obj);
        console.log(queue);
        findPair();
        console.log("find pair done");
        console.log("game point 2");
        return res.end(JSON.stringify(u));
    })
    .catch(err => {
        console.log("game point 3");
        return res.end("No access");
    });
});
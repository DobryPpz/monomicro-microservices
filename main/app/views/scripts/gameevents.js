import { canvas, context, token, getCanvasData, socket} from "./script.js";
import { drawMenu, buttonWidth, buttonHeight, clearEverything } from "./scenes.js";
import { getMousePosition } from "./menuevents.js";
import { GAME_IP, MAIN_IP } from "./constants.js"

let shootSound = document.createElement("audio");
shootSound.setAttribute("preload","auto");
let deathSound = document.createElement("audio");
deathSound.setAttribute("preload","auto");
let armorAdderImg = new Image();
armorAdderImg.onload = "sth";
armorAdderImg.src = "armoradder.png";
let hpAdderImg = new Image();
hpAdderImg.onload = "sth";
hpAdderImg.src = "hpadder.png";
let username;
let gameData = {};
let players = {};

function shootEvent(e){
    let position = getMousePosition(e);
    let factor = 20/Math.sqrt((position.x-players[username]["x"])**2+(position.y-players[username]["y"])**2);
    const data = {
        "code": gameData["code"],
        "username": username,
        "bullet": {
            "username": username,
            x: players[username]["x"],
            y: players[username]["y"],
            dx: (position.x-players[username]["x"])*factor,
            dy: (position.y-players[username]["y"])*factor
        }
    };
    shootSound.play();
    socket.emit("player-fire",data);
}

function moveEvent(e){
    switch(e.key){
        case "w":
            socket.emit("player-move",{
                "code": gameData["code"],
                "username": username,
                x: players[username]["x"],
                y: players[username]["y"]-5
            });
            break;
        case "s":
            socket.emit("player-move",{
                "code": gameData["code"],
                "username": username,
                x: players[username]["x"],
                y: players[username]["y"]+5
            });
            break;
        case "a":
            socket.emit("player-move",{
                "code": gameData["code"],
                "username": username,
                x: players[username]["x"]-5,
                y: players[username]["y"]
            });
            break;
        case "d":
            socket.emit("player-move",{
                "code": gameData["code"],
                "username": username,
                x: players[username]["x"]+5,
                y: players[username]["y"]
            });
            break;
    }
}

function exitEvent(e){
    if(e.key == "x"){
        socket.off();
        socket.emit("leave-room",gameData["code"]);
        clearEvents();
        fetch(`${MAIN_IP}/menu`,{
            method: "GET",
            headers: {
                "x-access-token": token
            }
        })
        .then(response => {
            return response.text();
        })
        .then(data => {
            let doc = new DOMParser().parseFromString(data,"text/html");
            document.body = doc.body;
            getCanvasData();
            drawMenu();
        });
    }
}

function clearEvents(){
    canvas.removeEventListener("click",shootEvent);
    window.removeEventListener("keydown",moveEvent);
    window.removeEventListener("keydown",exitEvent);
}

function getData(data){
    players[data["player1"]["username"]] = data["player1"];
    players[data["player2"]["username"]] = data["player2"];
    gameData["code"] = data["code"];
    gameData["bullets1"] = data["bullets1"];
    gameData["bullets2"] = data["bullets2"];
    gameData["hpAdders"] = data["hpAdders"];
    gameData["armorAdders"] = data["armorAdders"];
    if(data["player1"]["username"] == username){
        if(!shootSound.src){
            shootSound.src = data["player1"]["shootsound"];
        }
        if(!deathSound.src){
            deathSound.src = data["player1"]["deathsound"];
        }
    }
    else{
        if(!shootSound.src){
            shootSound.src = data["player2"]["shootsound"];
        }
        if(!deathSound.src){
            deathSound.src = data["player2"]["deathsound"];
        }
    }
}

function drawGame(){
    context.clearRect(0,0,800,600);
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText(`HP: ${players[username]["hp"]}    ARMOR: ${players[username]["armor"]}`,10,25);
    for(let p in players){
        context.beginPath();
        context.fillStyle = players[p]["skincolor"];
        context.arc(players[p]["x"],players[p]["y"],20,0,2*Math.PI);
        context.fill();
    }
    for(let b of gameData["bullets1"]){
        for(let p in players){
            if(b["username"] == players[p]["username"]){
                context.beginPath();
                context.fillStyle = players[p]["bulletcolor"]
                context.arc(b["x"],b["y"],5,0,2*Math.PI);
                context.fill();
                break;
            }
        }
    }
    for(let b of gameData["bullets2"]){
        for(let p in players){
            if(b["username"] == players[p]["username"]){
                context.beginPath();
                context.fillStyle = players[p]["bulletcolor"]
                context.arc(b["x"],b["y"],5,0,2*Math.PI);
                context.fill();
                break;
            }
        }
    }
    for(let i=0;i<gameData["hpAdders"].length;i++){
        context.drawImage(hpAdderImg,gameData["hpAdders"][i]["x"]-20,gameData["hpAdders"][i]["y"]-20);
    }
    for(let i=0;i<gameData["armorAdders"].length;i++){
        context.drawImage(armorAdderImg,gameData["armorAdders"][i]["x"]-20,gameData["armorAdders"][i]["y"]-20);
    }
}

export async function gameEvent(e){
    let position = getMousePosition(e);
    if(position.x >= canvas.width/2-buttonWidth/2 &&
        position.x <= canvas.width/2+buttonWidth/2 &&
        position.y >= canvas.height/4-2*buttonHeight &&
        position.y <= canvas.height/4-buttonHeight){
        clearEverything();
        getCanvasData();
        canvas.style.backgroundColor = "black";
        await fetch(`${GAME_IP}/game`,{
            method: "POST",
            headers: {
                "x-access-token": token,
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "socketid": socket.id
            })
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            username = data["username"];
        });
        socket.on("room-ready", roomId => {
            socket.emit("join-room",roomId);
            canvas.addEventListener("click",shootEvent);
            window.addEventListener("keydown",moveEvent);
            window.addEventListener("keydown",exitEvent);
        });
        socket.on("end-game", roomId => {
            deathSound.play();
            socket.emit("leave-room",roomId);
            clearEvents();
            fetch(`${MAIN_IP}/menu`,{
                method: "GET",
                headers: {
                    "x-access-token": token
                }
            })
            .then(response => {
                return response.text();
            })
            .then(data => {
                let doc = new DOMParser().parseFromString(data,"text/html");
                document.body = doc.body;
                getCanvasData();
                drawMenu();
            });
        });
        socket.on("update", data => {
            getData(data);
            drawGame();
        });
    }
}
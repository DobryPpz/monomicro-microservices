import { canvas, context, token, clearToken, setUpPage, getCanvasData } from "./script.js";
import { buttonWidth, buttonHeight, clearEverything, drawMenu } from "./scenes.js";
import { MAIN_IP } from "./constants.js"

export function getMousePosition(e){
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.round(e.clientX-rect.left),
        y: Math.round(e.clientY-rect.top)
    };
}

export function logoutEvent(e){
    let position = getMousePosition(e);
    if(position.x >= canvas.width/2-buttonWidth/2 &&
        position.x <= canvas.width/2+buttonWidth/2 &&
        position.y >= canvas.height-2*buttonHeight &&
        position.y <= canvas.height-buttonHeight){
        clearEverything();
        fetch(`${MAIN_IP}`,{
            method: "GET"
        }).then(response => {
            return response.text()
        })
        .then(data => {
            let doc = new DOMParser().parseFromString(data,"text/html");
            document.body = doc.body;
            clearEverything();
            clearToken();
            setUpPage();
        });
    }
}

export function scoreEvent(e){
    let position = getMousePosition(e);
    if(position.x >= canvas.width/2-buttonWidth/2 &&
        position.x <= canvas.width/2+buttonWidth/2 &&
        position.y >= 3*canvas.height/4-2*buttonHeight &&
        position.y <= 3*canvas.height/4-buttonHeight){
        clearEverything();
        fetch(`${MAIN_IP}/score`,{
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
            const scoreTable = document.getElementById("scoretable");
            const menuButton = document.getElementById("menubutton");
            const decreasingButton = document.getElementById("decreasingbutton");
            const playerScoreButton = document.getElementById("playerscorebutton");
            const increasingButton = document.getElementById("increasingbutton");
            menuButton.addEventListener("click",e => {
                clearEverything();
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
            decreasingButton.addEventListener("click",e => {
                fetch(`${MAIN_IP}/score/decreasing`,{
                    method: "GET",
                    headers: {
                        "x-access-token": token
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    scoreTable.innerHTML = "";
                    for(let i=0;i<data.length;i++){
                        let li = document.createElement("li");
                        li.innerText = `${i+1}: ${data[i]["username"]}  level: ${data[i]["level"]}`;
                        scoreTable.append(li);
                    }
                });
            });
            playerScoreButton.addEventListener("click",e => {
                fetch(`${MAIN_IP}/score/player`,{
                    method: "GET",
                    headers: {
                        "x-access-token": token
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    scoreTable.innerHTML = "";
                    let li = document.createElement("li");
                    li.innerText = `${data["username"]} Pozycja w rankingu: ${data["rank"]}`;
                    scoreTable.append(li);
                });
            });
            increasingButton.addEventListener("click",e => {
                fetch(`${MAIN_IP}/score/increasing`,{
                    method: "GET",
                    headers: {
                        "x-access-token": token
                    }
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    scoreTable.innerHTML = "";
                    for(let i=0;i<data.length;i++){
                        let li = document.createElement("li");
                        li.innerText = `${i+1}: ${data[i]["username"]}  level: ${data[i]["level"]}`;
                        scoreTable.append(li);
                    }
                });
            });
        });
    }
}



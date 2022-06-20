import { canvas, context, getCanvasData, token } from "./script.js";
import { buttonWidth, buttonHeight, drawMenu } from "./scenes.js";
import { getMousePosition } from "./menuevents.js";
import { MAIN_IP } from "./constants.js"

export function settingsEvent(e){
    let position = getMousePosition(e);
    if(position.x >= canvas.width/2-buttonWidth/2 &&
    position.x <= canvas.width/2+buttonWidth/2 &&
    position.y >= 2*canvas.height/4-2*buttonHeight &&
    position.y <= 2*canvas.height/4-buttonHeight){
        fetch(`${MAIN_IP}/settings`,{
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
            const saveButton = document.getElementById("save");
            const returnButton = document.getElementById("goback");
            returnButton.addEventListener("click",e => {
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
            saveButton.addEventListener("click",e => {
                let shootSounds = Array.from(document.getElementById("shootsounds").children).filter(el => el.type == "radio");
                let deathSounds = Array.from(document.getElementById("deathsounds").children).filter(el => el.type == "radio");
                let skinColors = Array.from(document.getElementById("skincolors").children).filter(el => el.type == "radio");
                let bulletColors = Array.from(document.getElementById("bulletcolors").children).filter(el => el.type == "radio");
                let ret = {};
                for(let s of shootSounds){
                    if(s.checked){
                        ret["newshootsound"] = s.value;
                        break;
                    }
                }
                for(let s of deathSounds){
                    if(s.checked){
                        ret["newdeathsound"] = s.value;
                        break;
                    }
                }
                for(let s of skinColors){
                    if(s.checked){
                        ret["newskincolor"] = s.value;
                        break;
                    }
                }
                for(let s of bulletColors){
                    if(s.checked){
                        ret["newbulletcolor"] = s.value;
                        break;
                    }
                }
                fetch(`${MAIN_IP}/settings/save`,{
                    method: "POST",
                    headers: {
                        "x-access-token": token,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(ret)
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                });
            });
        });
    }
}
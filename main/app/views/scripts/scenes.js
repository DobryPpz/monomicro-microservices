import { canvas, context } from "./script.js";
import { logoutEvent, scoreEvent } from "./menuevents.js";
import { settingsEvent } from "./settingsevents.js";
import { gameEvent } from "./gameevents.js";

export let canvasEvents = [];

export let buttonWidth;
export let buttonHeight;

export function drawMenu(){
    let graj = new Image();
    let ustawienia = new Image();
    let wyniki = new Image();
    let wyloguj = new Image();
    graj.src = "GRAJ.png";
    graj.onload = () => {
        context.drawImage(graj,
            canvas.width/2-(graj.width*0.4)/2,
            canvas.height/4-graj.height*0.8,
            graj.width*0.4,
            graj.height*0.4);
        buttonWidth = graj.width*0.4;
        buttonHeight = graj.height*0.4; 
    };
    canvas.addEventListener("click",gameEvent);
    canvasEvents.push(gameEvent);
    ustawienia.src = "USTAWIENIA.png";
    ustawienia.onload = () => {
        context.drawImage(ustawienia,
            canvas.width/2-(ustawienia.width*0.4)/2,
            2*canvas.height/4-ustawienia.height*0.8,
            ustawienia.width*0.4,
            ustawienia.height*0.4);
    };
    canvas.addEventListener("click",settingsEvent);
    canvasEvents.push(settingsEvent);
    wyniki.src = "WYNIKI.png";
    wyniki.onload = () => {
        context.drawImage(wyniki,
            canvas.width/2-(wyniki.width*0.4)/2,
            3*canvas.height/4-wyniki.height*0.8,
            wyniki.width*0.4,
            wyniki.height*0.4);
    };
    canvas.addEventListener("click",scoreEvent);
    canvasEvents.push(scoreEvent);
    wyloguj.src = "WYLOGUJ.png";
    wyloguj.onload = () => {
        context.drawImage(wyloguj,
            canvas.width/2-(wyloguj.width*0.4)/2,
            canvas.height-wyloguj.height*0.8,
            wyloguj.width*0.4,
            wyloguj.height*0.4);
    };
    canvas.addEventListener("click",logoutEvent);
    canvasEvents.push(logoutEvent);
}

export function clearEverything(){
    context.clearRect(0,0,canvas.width,canvas.height);
    canvasEvents.map(l => {
        canvas.removeEventListener("click",l);
    });
    canvasEvents = [];
}
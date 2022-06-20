export let canvas;
export let context;
export let token;

import { drawMenu } from "./scenes.js";
import { MAIN_IP, GAME_IP } from "./constants.js"

import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"
export const socket = io(GAME_IP);
socket.emit("hello");
socket.on("hi",data => {
    console.log("server says hi");
});

export function clearToken(){
    token = "";
}

export function getCanvasData(){
    canvas = document.getElementById("canv");
    canvas.width = 800;
    canvas.height = 600;
    context = canvas.getContext("2d");
}

export function setUpPage(){
    const signupButton = document.getElementById("signup");
    const signinButton = document.getElementById("signin");
    const usernameSignup = document.getElementById("usernamesignup");
    const passwordSignup = document.getElementById("passwordsignup");
    const usernameSignin = document.getElementById("usernamesignin");
    const passwordSignin = document.getElementById("passwordsignin");
    const message = document.getElementById("message");
    signupButton.addEventListener("click",e => {
        const data = {
            "username": usernameSignup.value,
            "password": passwordSignup.value
        };
        fetch(`${MAIN_IP}/auth/signup`,{
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(d => {
            message.innerHTML = d.message;
        });
    });
    
    signinButton.addEventListener("click", async e => {
        const data = {
            "username": usernameSignin.value,
            "password": passwordSignin.value
        };
        //console.log(data);
        const res = await fetch(`${MAIN_IP}/auth/signin`,{
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => response.json());
        console.log(res);
        fetch(`${MAIN_IP}/menu`,{
            method: "GET",
            headers: {
                "x-access-token": res["x-access-token"]
            }
        }).then(response => {
            token = res["x-access-token"];
            return response.text()
        })
        .then(data => {
            let doc = new DOMParser().parseFromString(data,"text/html");
            document.body = doc.body;
            getCanvasData();
            drawMenu();
        });
    });
}

setUpPage();
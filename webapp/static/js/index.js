"use strict"
let chat1log="";
const socket = new WebSocket("ws://localhost:8080")
const chat1logp=document.getElementById("f1ChatLog");
let idregistered;
document.getElementById("firstChatbox").addEventListener("change",(e)=>{
    if(e.target.name==="type"){
        if(e.target.value==="priv"){            
            document.getElementById("idConts").removeAttribute("hidden");
            document.getElementById("userIdmi").removeAttribute("disabled");
        }else{
            document.getElementById("idConts").setAttribute("hidden",true);
            document.getElementById("userIdmi").setAttribute("disabled",true);
        }
    }
})
socket.addEventListener("open",(event)=>{
    console.log("Connected to server");
    socket.send(JSON.stringify({type:"serv",content:"Hello server"}) )
})
socket.addEventListener("message",(event)=>{  
    const servRes=JSON.parse(event.data);
    if(servRes.type==="welcome"){
        document.getElementById("idCont").innerText=servRes.id;
        idregistered=servRes.id
    }else if(servRes.type==="message"){
        chat1log+="\n "+servRes.res;
        chat1logp.innerText=chat1log;
    }    
})
socket.addEventListener("error",err=>{
    console.error("Websocker error: ",err);
})
socket.addEventListener("close",()=>{
    console.log("connetion closed");
})
const f1=document.getElementById("firstChatbox");
f1.addEventListener("submit",(e)=>{    
    e.preventDefault();    
    const message=f1.elements["mes"].value;
    const type = f1.elements["type"].value;    
    f1.elements["mes"].value="";
    switch(type){
        case "serv":
            sendMessageServ(message);
            break;
        case "broad":
            sendMessageBroadcast(message);
            break;
        case "priv":

            sendMessagePriv(message,f1.elements["userIdm"].value)
            break;
        default:
            sendMessageServ(message);
    }
    
});
function sendMessageServ(message){
    socket.send(JSON.stringify({type:"serv",content:message}));
}
function sendMessageBroadcast(message){
    socket.send(JSON.stringify({type:"broad",content:message,"from":idregistered}));
}
function sendMessagePriv(message,id){    
    socket.send(JSON.stringify({type:"priv",content:message,id,"from":idregistered,"to":id}));
}
window.clicktest=()=>{
    console.log("click")
}

const Websocket=require("ws");
const fs = require("fs");
const {v4: uuidv4}= require("uuid");
const { sendVideoMp4 } = require("./mp4Utils");
const path = require("path");
const wss = new Websocket.Server({
    port:8080
});
const clients = new Map();

wss.on("connection",ws=>{
    
    const id=uuidv4();
    console.log("Client connected with id: ",id);
    clients.set(id,ws)
    ws.send(JSON.stringify({type:"welcome",id}));
    
    ws.on("message",message=>{   
         const obj=JSON.parse(message);         
         switch (obj.type){
            case "servFile":
                const imgMime="image/jpeg";
                ws.send(JSON.stringify({type:"filemeta",mime:imgMime}))
                const fileStream = fs.readFileSync("./surprise.jpg");
                ws.send(fileStream)
                ws.send(JSON.stringify({type:"endfile"}));
                break;
            case "servFileStream":                
                sendVideoMp4(ws,path.join(__dirname,"output_frag.mp4"));
                
                
                break;
            case "serv":
                 ws.send(JSON.stringify({type:"message",res:`Server: ${obj["content"]}`}))
                break;
            case "broad":                
                wss.clients.forEach(client=>{
                    if(client.readyState===Websocket.OPEN){
                        client.send(JSON.stringify({type:"message",res:`Broadcast Message from ${id}: ${obj["content"]}`}))
                    }
                })
                break;
            case "priv":  
                const target  = clients.get(obj["to"]);
                if(target && target.readyState === Websocket.OPEN){
                    target.send(JSON.stringify({type:"message",res:`Private Message from ${id}: ${obj["content"]}`}))
                }
                break;
            default:
                 ws.send(JSON.stringify({type:"message",res:`Server: ${obj["content"]}`}) )
         }
    });
    ws.on("close",()=>{
        clients.delete(id);
        console.log("Client disconnected: ",id);
    });
})
console.log("web socket listening at ws://localhost:8080");
// setInterval(() => {
//     console.log("Sending heartbeat");
//     wss.clients.forEach(client => {
//         if(client.readyState === Websocket.OPEN){
//             client.send(JSON.stringify({type:"message",res:`Server: Sending heartbeat`}));
//         }
//     });
// }, 10000);


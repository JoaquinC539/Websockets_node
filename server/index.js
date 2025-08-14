const Websocket=require("ws");
const {v4: uuidv4}= require("uuid")
const wss = new Websocket.Server({
    port:8080
});
const clients = new Map();
console.log("web socket listening at ws://localhost:8080")
wss.on("connection",ws=>{
    console.log("Client connected");
    const id=uuidv4();
    clients.set(id,ws)
    ws.send(JSON.stringify({type:"welcome",id}));
    ws.on("message",message=>{   
         const obj=JSON.parse(message);         
         switch (obj.type){
            case "serv":
                 ws.send(JSON.stringify({type:"message",res:`Server: ${obj["content"]}`}) )
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
        console.log("Client disconnected");
    });
})

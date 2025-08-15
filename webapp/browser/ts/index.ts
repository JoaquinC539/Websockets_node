import { FilePrep, Message, Register, ServRes } from "./types/ServRes";
import { WebCommand } from "./types/WebCommand";

// export {}; 
declare global {
    interface Window {
        askVideo: () => void;
        askImage: () => void;
        clicktest: () => void;
    }
}
let chat1log="";
const socket = new WebSocket("ws://localhost:8080")
const chat1logp:HTMLParagraphElement=document.getElementById("f1ChatLog") as HTMLParagraphElement;
let idregistered:string;
document.getElementById("firstChatbox")?.addEventListener("change",(e)=>{
    if(((e.target as HTMLInputElement)?.name  )==="type"){
        if((e.target as HTMLInputElement)?.value==="priv"){            
            document.getElementById("idConts")?.removeAttribute("hidden");
            document.getElementById("userIdmi")?.removeAttribute("disabled");
        }else{
            document.getElementById("idConts")?.setAttribute("hidden","true");
            document.getElementById("userIdmi")?.setAttribute("disabled","true");
        }
    }
})
socket.addEventListener("open",(event)=>{
    console.log("Connected to server");
    socket.send(JSON.stringify({type:"serv",content:"Hello server"}) )
});


let imageChunk:Blob[]=[];
let currentFileMeta:FilePrep|null=null;
let mediaSource:MediaSource|null=null;
let sourceBuffer:SourceBuffer|null=null;
let queue:ArrayBuffer[]=[];
let firstvideoUpdate:boolean=true;
let endfile=false;
const videoElem = document.getElementById("videoServ") as HTMLVideoElement;  
socket.binaryType= "arraybuffer";
socket.addEventListener("message",(event)=>{
    
    if(typeof event.data ==="string"){
        const servRes:ServRes=JSON.parse(event.data);

        if(servRes.type==="filemeta"){

            currentFileMeta=servRes as FilePrep
            imageChunk=[]
            
            if((servRes as FilePrep).mime.startsWith("video/")){
                const mime=currentFileMeta.mime;
                console.log(mime)
                if("MediaSource" in window && MediaSource.isTypeSupported(mime)){
                    const mediaSource=new MediaSource();
                    videoElem.src=URL.createObjectURL(mediaSource);
                    videoElem.removeAttribute("hidden");
                    mediaSource.addEventListener("sourceopen",sourceOpen=>{ 
                        if(!mediaSource)return;
                        sourceBuffer=mediaSource.addSourceBuffer(mime);
                        if (sourceBuffer !== null) {                            
                            sourceBuffer.onupdateend = (e) => {
                                if(queue.length>0 && !sourceBuffer?.updating){
                                    const chunk = queue.shift();
                                    if(chunk){
                                        sourceBuffer?.appendBuffer(chunk)
                                    }
                                }
                                if(queue.length===0 && endfile && !sourceBuffer!.updating){
                                    endfile=false;
                                    console.log("should log when queue is finished")
                                    mediaSource.endOfStream();
                                    
                                }
                            }
                        }
                    })
                }
            } 
            return;          
            
        }
        if(servRes.type==="endfile"){
            if(currentFileMeta?.mime.startsWith("image/")){
                const fullBlob = new Blob(imageChunk,{type:currentFileMeta.mime});
                const img = document.getElementById("imgServ") as HTMLImageElement;
                img.src= URL.createObjectURL(fullBlob);
                img.removeAttribute("hidden");
                
            }
            else if (currentFileMeta?.mime.startsWith("video/")) {
                console.log("endfile")
                endfile=true;
                
            }
            currentFileMeta=null;            
            imageChunk=[];
            return;


            
        }

        if(servRes.type==="welcome"){
            (document.getElementById("idCont") as HTMLSpanElement).innerText=(servRes as Register).id;
            idregistered=(servRes as Register).id
        }
        if(servRes.type==="message"){
            chat1log+="\n "+(servRes as Message).res;
            chat1logp.innerText=chat1log;
        }
        return; 
    }
    if(event.data instanceof ArrayBuffer){
        if(currentFileMeta?.mime.startsWith("image/")){
            imageChunk.push(new Blob([event.data]))
        }
        if(currentFileMeta?.mime.startsWith("video/")){
            if(sourceBuffer && firstvideoUpdate && !sourceBuffer.updating){
                firstvideoUpdate=false;
                sourceBuffer.appendBuffer(event.data)
            }else{
                queue.push(event.data);
            } 
        }
    }
    
       
})
socket.addEventListener("error",err=>{
    console.error("Websocker error: ",err);
})
socket.addEventListener("close",()=>{
    console.log("connetion closed");
})
const f1=document.getElementById("firstChatbox") as HTMLFormElement;
if(f1!==null){
    f1.addEventListener("submit",(e)=>{    
        e.preventDefault();    
        const message:string = (f1.elements.namedItem("mes") as HTMLInputElement).value;
        const type:string = (f1.elements.namedItem("type") as HTMLInputElement).value;    
        (f1.elements.namedItem("mes") as HTMLInputElement).value = "";
        switch(type){
            case "serv":
                sendMessageServ(message);
                break;
            case "broad":
                sendMessageBroadcast(message);
                break;
            case "priv":

                sendMessagePriv(message,(f1?.elements.namedItem("userIdm") as HTMLInputElement).value)
                break;
            default:
                sendMessageServ(message);
        }
        
    });
}

function sendMessageServ(message:string){
    socket.send(JSON.stringify(({type:"serv",content:message} as WebCommand)));
}
function sendMessageBroadcast(message:string){
    socket.send(JSON.stringify(({type:"broad",content:message,"from":idregistered} as WebCommand)));
}
function sendMessagePriv(message:string,id:string){    
    socket.send(JSON.stringify(({type:"priv",content:message,id,"from":idregistered,"to":id}as WebCommand)));
}
window.askVideo=()=>{
    videoElem.removeAttribute("src")
    mediaSource=null;
    currentFileMeta=null;
    sourceBuffer=null;
    queue=[];
    document.getElementById("askvid")?.setAttribute("disabled","true");
    socket.send(JSON.stringify(({type:"servFileStream" }as WebCommand)));
}
window.askImage=()=>{
    socket.send(JSON.stringify(({type:"servFile"}as WebCommand)));
}
window.clicktest=()=>{
    console.log("click")
}

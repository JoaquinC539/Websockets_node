
const { spawn } = require("child_process");
const fs = require("fs")

function sendVideoMp4(ws,filePath){
    const mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
    ws.send(JSON.stringify({ type: "filemeta", mime: mimeType }));
    // const ffmpeg = spawn("ffmpeg",[
    //     "-i",filePath,
    //     "-movflags","frag_keyframe+empty_moov+default_base_moof",
    //     "-f","mp4",
    //     "-"
    // ]);
    // ffmpeg.stdout.on("data",chunk=>{
    //     ws.send(chunk)
    // })
    // ffmpeg.stderr.on("data",err=>console.error("ffmpeg stderr: ",err.toString()));
    // ffmpeg.on("close",code=>{
    //     console.log("ffmpeg process exited with code "+code);
    //     ws.send(JSON.stringify({type:"endfile"}));
    // })
    // ffmpeg.on("error", err => {
    //     console.error("Failed to start ffmpeg:", err);
    // });
    const stream = fs.createReadStream(filePath,{highWaterMark:64*1024});
    stream.on("data",(chunk=>ws.send(chunk)));
    stream.on("end", () => ws.send(JSON.stringify({ type: "endfile" })));
}
module.exports={sendVideoMp4}
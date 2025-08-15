var _a;
let chat1log = "";
const socket = new WebSocket("ws://localhost:8080");
const chat1logp = document.getElementById("f1ChatLog");
let idregistered;
(_a = document.getElementById("firstChatbox")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", (e) => {
    var _a, _b, _c, _d, _e, _f;
    if (((_a = e.target) === null || _a === void 0 ? void 0 : _a.name) === "type") {
        if (((_b = e.target) === null || _b === void 0 ? void 0 : _b.value) === "priv") {
            (_c = document.getElementById("idConts")) === null || _c === void 0 ? void 0 : _c.removeAttribute("hidden");
            (_d = document.getElementById("userIdmi")) === null || _d === void 0 ? void 0 : _d.removeAttribute("disabled");
        }
        else {
            (_e = document.getElementById("idConts")) === null || _e === void 0 ? void 0 : _e.setAttribute("hidden", "true");
            (_f = document.getElementById("userIdmi")) === null || _f === void 0 ? void 0 : _f.setAttribute("disabled", "true");
        }
    }
});
socket.addEventListener("open", (event) => {
    console.log("Connected to server");
    socket.send(JSON.stringify({ type: "serv", content: "Hello server" }));
});
let imageChunk = [];
let currentFileMeta = null;
let mediaSource = null;
let sourceBuffer = null;
let queue = [];
let firstvideoUpdate = true;
let endfile = false;
const videoElem = document.getElementById("videoServ");
socket.binaryType = "arraybuffer";
socket.addEventListener("message", (event) => {
    if (typeof event.data === "string") {
        const servRes = JSON.parse(event.data);
        if (servRes.type === "filemeta") {
            currentFileMeta = servRes;
            imageChunk = [];
            if (servRes.mime.startsWith("video/")) {
                const mime = currentFileMeta.mime;
                console.log(mime);
                if ("MediaSource" in window && MediaSource.isTypeSupported(mime)) {
                    const mediaSource = new MediaSource();
                    videoElem.src = URL.createObjectURL(mediaSource);
                    videoElem.removeAttribute("hidden");
                    mediaSource.addEventListener("sourceopen", sourceOpen => {
                        if (!mediaSource)
                            return;
                        sourceBuffer = mediaSource.addSourceBuffer(mime);
                        if (sourceBuffer !== null) {
                            sourceBuffer.onupdateend = (e) => {
                                if (queue.length > 0 && !(sourceBuffer === null || sourceBuffer === void 0 ? void 0 : sourceBuffer.updating)) {
                                    const chunk = queue.shift();
                                    if (chunk) {
                                        sourceBuffer === null || sourceBuffer === void 0 ? void 0 : sourceBuffer.appendBuffer(chunk);
                                    }
                                }
                                if (queue.length === 0 && endfile && !sourceBuffer.updating) {
                                    endfile = false;
                                    console.log("should log when queue is finished");
                                    mediaSource.endOfStream();
                                }
                            };
                        }
                    });
                }
            }
            return;
        }
        if (servRes.type === "endfile") {
            if (currentFileMeta === null || currentFileMeta === void 0 ? void 0 : currentFileMeta.mime.startsWith("image/")) {
                const fullBlob = new Blob(imageChunk, { type: currentFileMeta.mime });
                const img = document.getElementById("imgServ");
                img.src = URL.createObjectURL(fullBlob);
                img.removeAttribute("hidden");
            }
            else if (currentFileMeta === null || currentFileMeta === void 0 ? void 0 : currentFileMeta.mime.startsWith("video/")) {
                console.log("endfile");
                endfile = true;
            }
            currentFileMeta = null;
            imageChunk = [];
            return;
        }
        if (servRes.type === "welcome") {
            document.getElementById("idCont").innerText = servRes.id;
            idregistered = servRes.id;
        }
        if (servRes.type === "message") {
            chat1log += "\n " + servRes.res;
            chat1logp.innerText = chat1log;
        }
        return;
    }
    if (event.data instanceof ArrayBuffer) {
        if (currentFileMeta === null || currentFileMeta === void 0 ? void 0 : currentFileMeta.mime.startsWith("image/")) {
            imageChunk.push(new Blob([event.data]));
        }
        if (currentFileMeta === null || currentFileMeta === void 0 ? void 0 : currentFileMeta.mime.startsWith("video/")) {
            if (sourceBuffer && firstvideoUpdate && !sourceBuffer.updating) {
                firstvideoUpdate = false;
                sourceBuffer.appendBuffer(event.data);
            }
            else {
                queue.push(event.data);
            }
        }
    }
});
socket.addEventListener("error", err => {
    console.error("Websocker error: ", err);
});
socket.addEventListener("close", () => {
    console.log("connetion closed");
});
const f1 = document.getElementById("firstChatbox");
if (f1 !== null) {
    f1.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = f1.elements.namedItem("mes").value;
        const type = f1.elements.namedItem("type").value;
        f1.elements.namedItem("mes").value = "";
        switch (type) {
            case "serv":
                sendMessageServ(message);
                break;
            case "broad":
                sendMessageBroadcast(message);
                break;
            case "priv":
                sendMessagePriv(message, (f1 === null || f1 === void 0 ? void 0 : f1.elements.namedItem("userIdm")).value);
                break;
            default:
                sendMessageServ(message);
        }
    });
}
function sendMessageServ(message) {
    socket.send(JSON.stringify({ type: "serv", content: message }));
}
function sendMessageBroadcast(message) {
    socket.send(JSON.stringify({ type: "broad", content: message, "from": idregistered }));
}
function sendMessagePriv(message, id) {
    socket.send(JSON.stringify({ type: "priv", content: message, id, "from": idregistered, "to": id }));
}
window.askVideo = () => {
    var _a;
    videoElem.removeAttribute("src");
    mediaSource = null;
    currentFileMeta = null;
    sourceBuffer = null;
    queue = [];
    (_a = document.getElementById("askvid")) === null || _a === void 0 ? void 0 : _a.setAttribute("disabled", "true");
    socket.send(JSON.stringify({ type: "servFileStream" }));
};
window.askImage = () => {
    socket.send(JSON.stringify({ type: "servFile" }));
};
window.clicktest = () => {
    console.log("click");
};
export {};

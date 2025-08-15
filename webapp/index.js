const express= require('express')
const bodyParser=require('body-parser')
const cors=require('cors');
const PORT=3752;
const app=express();
const path=require('path');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname+"/browser/static"));
app.use("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"browser","static","html","index.html"))
})

app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
});
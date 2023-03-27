const express=require("express");
const jwt=require("jsonwebtoken");
const app=express();
const secretKey="secretkey";

app.get("/",(req,resp)=>{
    resp.json({
        message:"a simple api"
    })
})
app.post("/login",(req,resp)=>{
    const user={
        id:1,
        userName:"likun",
        email:"likun@gmail.com"
    }
    jwt.sign({user},secretKey,{expiresIn:"300s"},(err,token)=>{
        resp.json({
            token
        })
    })
})
app.post("/profile",verifyToken,(req,resp)=>{
    jwt.verify(req.token,secretKey,(err,authData)=>{
        if(err){
            resp.send({
                result:"Invalid token"
            })
        }else{
            resp.json({
                message:"Profile accessed",
                authData
            })
        }
    })
})
function verifyToken(req,resp,next) {
    const bearerHeader=req.headers['authorization'];
    if(typeof bearerHeader !='undefined'){
        const bearer=bearerHeader.split(" ");
        const token=bearer[1];
        req.token=token;
        next();
    }else{
        resp.send({
            result:'Token is not valid'
        })
    }
}
app.listen(5000,()=>{
    console.log("App is running 5000 port");
})
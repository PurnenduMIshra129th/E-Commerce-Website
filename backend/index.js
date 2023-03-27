//npm init to create package.json
//npm i express
//npm i mongoose to conect mongo db
//npm i nodemon
//npm i cors to avoid cors error it is block request given by browser to api 
const express=require('express');
const cors=require("cors");
require('./db/config');
const User=require("./db/User");
const Product=require("./db/Product")
const Jwt=require("jsonwebtoken");
const jwtKey='e-comm';

const app=express();
// to send data from post man to node js
app.use(express.json());
app.use(cors());

//Register API
app.post("/register",async(req, resp)=>{
    //these two line save the async function result in data base
    let user=new User(req.body);
    let result= await user.save();

    result=result.toObject();
    delete result.password;
    // resp.send(result) //before jwt token in this we will work
    Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
            resp.send({result:"Something went wrong,Please try after Some time"})
        }
        resp.send({result,auth:token})
    })

})

//Login API
app.post("/login",async (req,resp)=>{
    if(req.body.password && req.body.email){
        let user= await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err){
                    resp.send({result:"Something went wrong,Please try after Some time"})
                }
                resp.send({user,auth:token})
            })
            // resp.send(user);//before jwt token
        }
        else{
            resp.send({result:'No User found'});
        }
    }
    else{
        resp.send({result:"No User Found"})
    }
  
})
//Add Product API
app.post("/add-product",verifyToken,async(req,resp)=>{
    let product=new Product(req.body);
    let result=await product.save();
    resp.send(result)
})
app.get("/products",verifyToken,async (req,resp)=>{
    let products= await Product.find();
    if(products.length>0){
        resp.send(products)
    }
    else{
        resp.send({result:"No product found"})
    }
})
app.delete("/product/:id",verifyToken,async (req,resp)=>{
    const result=await Product.deleteOne({_id:req.params.id})
    resp.send(req.params.id);

})
app.get("/product/:id",verifyToken,async (req,resp)=>{
    let result=await Product.findOne({_id:req.params.id})
    if(result){
        resp.send(result)
    }
    else{
        resp.send({result:"No Record found"})
    }
})
app.put("/product/:id",verifyToken,async (req,resp)=>{
    let result=await Product.updateOne(
        {_id:req.params.id},
        {
            $set:req.body
        }
    )
    resp.send(result)

})
//due to middleware we use verifyToken
app.get("/search/:key",verifyToken,async (req,resp)=>{
    let result=await Product.find({
        "$or":[
            
               { name:{$regex:req.params.key}},
                {company:{$regex:req.params.key}},
                {category:{$regex:req.params.key}}    
        ]
    });
    resp.send(result);
})
function verifyToken(req,resp,next) {
    let token=req.headers['authorization']
    if(token){
        token=token.split(' ')[1];
        // console.log("middleware called if condition",token);
        Jwt.verify(token,jwtKey,(err,valid)=>{
            if(err){
                resp.status(401).send({result:"Please provide valid token "})
                
            }else{
                next()
            }
        })
    }else{
        resp.status(403).send({result:"Please add token with header"})
    }
    // console.log("middleware called",token);
    // next();
}
app.listen(5000);
//body->raw->text->json
//to send data from post man to node js
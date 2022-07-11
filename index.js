import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


const app = express();

dotenv.config()



// const PORT=process.env.PORT;
const PORT=5000
app.use(express.json());

app.use(cors());

const MONGO_URL = process.env.MONGO;

async function Createconnection() {
    const Client = new MongoClient(MONGO_URL);
    await Client.connect();
    console.log(`Mongo connected on ${PORT}`);
    return Client;
  }



  export const Client = await Createconnection();


  const auth=(req,res,next)=>{
    try{
    const token=req.header("x-auth-token");
    console.log(token);
    const key=process.env.SECRET_KEY
    console.log(key)

    jwt.verify(token, key)
    next();}
    catch(err){
      res.status(401).send({ 
        error: err.message
        // msg:"nh"
      }
        )
    }
  }
  

app.get("/",auth,function (req, res) {
    res.send("backend server created");
  });

  app.post("/signup", async function (req, res) {
    // res.send("backend server created");
  
   const {username,password} = req.body;

   const confirmhashedpassword= await genhashedpassword(password)

   const isUserExist= await Client.db("B33WD").collection("users").findOne({username:username})

   if(isUserExist){
    res.status(400).send({msg:"try new username"})
   }else{
const result = await Client.db("B33WD").collection("users").insertOne({username:username,password:confirmhashedpassword,})
res.send(result)

   }

// console.log(isUserExist)

  });


app.post("/login",async function(req,res){
  const {username,password}=req.body;
  const userfromdb = await Client.db("B33WD").collection("users").findOne({username:username})
  // const dbpassword=userfromdb.password;
  // console.log(dbpassword)
  if(!userfromdb){
     res.status(401).send({
      msg:"signup plz,Invalid credentials"
     })
  }
  else{
    const alreadystoredpassword=userfromdb.password;
    const ispasswordmatch=  await bcrypt.compare(password,alreadystoredpassword)

    if(ispasswordmatch){
      const token=jwt.sign({id:userfromdb._id},process.env.SECRET_KEY)
      res.send(
        {
          msg:"successful login",token:token
        }
      )
    }else{
      res.send({
        msg:"password worng ,invalid "
      })
    }

// res.send(ispasswordmatch)
  }
} )





app.listen(PORT, () => console.log(`App started in ${PORT}`));



async function genhashedpassword(password){
  const rounds=10;
  const salt = await bcrypt.genSalt(rounds);
  // console.log(salt,"this is salt")
const hashedpassword= await bcrypt.hash(password,salt);
// console.log("hassed",hashedpassword);
return hashedpassword


}

// genhashedpassword("ku")



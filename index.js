import express from "express";
import urlencoded from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken"
import { ObjectId } from "mongodb";
import cookieParser from "cookie-parser"
import { LocalStorage } from "node-localstorage";

import mongoose  from "mongoose";

// import { LocalStorage } from "node-localstorage";

// https://www.youtube.com/watch?v=enopDSs3DRw

const app = express();


dotenv.config()



const PORT=process.env.PORT || 5000;


app.use(cookieParser())

app.use(cors(
  {
    origin:["http://localhost:3000",'https://mycapston.netlify.app'],
    methods: ['GET','POST','PUT','DELETE'],
    credentials:true,

  }
));
// app.use(express.urlencoded({extended:false}))
app.use(express.urlencoded({ extended:true}));

app.use(express.json());


const MONGO_URL = process.env.MONGO;

const SECRET_KEY=process.env.SECRET_KEY

// async function Createconnection() {
//     const Client = new MongoClient(MONGO_URL);
//     await Client.connect();
//     console.log(`Mongo connected on ${PORT}`);
//     return Client;
//   }


const Createconnection = async ()=>{
  try{
    mongoose.connect(MONGO_URL,{
      useNewUrlParser: true,
      useUnifiedTopology:true,
    })
    console.log("MongoDB connected")

  }catch(err){
    console.log(err)
  }
}



  export const Client = await Createconnection();


  const userSchema = new mongoose.Schema({
    username:{
      type: String,
      required:true,
      unique:true,
    },
    email:{
      type: String,
      required:true,
      unique:true,
    },
    password:{
      type: String,
      required:true,
    },
    employeid:{
      type: String,
      required:true,
      unique:true,
    },
    phone:{
      type: String,
      required:true,
      unique:true,
    },
    address:{
      type: String,
      required:true,
    },
    tokens:[{
       token:{
        type:String,
        required:true,
       }
    }]

  })


userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password= await bcrypt.hash(this.password,10)
  }
  next()
})

userSchema.methods.generateValidToken = async function () {
  try{
    const generatedToken = jwt.sign({_id:this._id},process.env.SECRET_KEY);
    this.tokens=this.tokens.concat({token:generatedToken})
    await this.save()
    return generatedToken

  }catch(err){
    console.log(err)
  }
}

const User = mongoose.model("User",userSchema)








const adminSchema = new mongoose.Schema({
  username:{
    type: String,
    required:true,
    unique:true,
  },
  // email:{
  //   type: String,
  //   required:true,
  //   unique:true,
  // },
  password:{
    type: String,
    required:true,
    unique:true,
  },
  
  tokens:[{
     token:{
      type:String,
      required:true,
     }
  }]

})

adminSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password= await bcrypt.hash(this.password,10)
  }
  next()
})

adminSchema.methods.generateValidToken = async function () {
  try{
    const generatedToken = jwt.sign({_id:this._id},process.env.SECRET_KEY);
    this.tokens=this.tokens.concat({token:generatedToken})
    await this.save()
    return generatedToken

  }catch(err){
    console.log(err)
  }
}


const Admin = mongoose.model("Admin",adminSchema)




const FoodSchema = new mongoose.Schema({
  foodname:{
    type: String,
    required:true,
    // unique:true,
  },
  // email:{
  //   type: String,
  //   required:true,
  //   unique:true,
  // },
  description:{
    type: String,
    required:true,
    // unique:true,
  },
 img:{
  type:String,
  required:true
 }
 

})


const Foods = mongoose.model("Foods",FoodSchema)

const PendingTokenSchema = new mongoose.Schema({

username:{
  type:String,
  required:true,

},

Foodname:{
  type: String,
  required:true,
  // unique:true,
},

description:{
  type: String,
  required:true,
  // unique:true,
},
 img:{
  type:String,
  required:true
 },
 Date:{
  type:String,
  required:true
 },
 Time:{
  type:String,
  required:true
 },
 

})


const PendingTokens = mongoose.model("PendingTokens",PendingTokenSchema)


const AcceptedTokenSchema = new mongoose.Schema({

username:{
  type:String,
  required:true,

},

foodName:{
  type: String,
  required:true,
  // unique:true,
},

description:{
  type: String,
  required:true,
  // unique:true,
},
 img:{
  type:String,
  required:true
 },
 Date:{
  type:String,
  required:true
 },
 Time:{
  type:String,
  required:true
 },
 OrderId:{
  type:Number,
  required:true
 }
 

})


const AcceptedTokens = mongoose.model("AcceptedTokens",AcceptedTokenSchema)


const RejectedTokenSchema = new mongoose.Schema({

username:{
  type:String,
  required:true,

},

foodName:{
  type: String,
  required:true,
  // unique:true,
},

description:{
  type: String,
  required:true,
  // unique:true,
},
 img:{
  type:String,
  required:true
 },
 Date:{
  type:String,
  required:true
 },
 Time:{
  type:String,
  required:true
 },
 
 

})


const RejectedTokens = mongoose.model("RejectedTokens",RejectedTokenSchema)











  const auth= async (req,res,next)=>{
    try{
    // const token=req.header("token");


    const token=req.cookies.token;

    // const token=req.header('Authorization').replace('Bearer ', "")

    // const token = await Client.db("B33WD").collection("users").findOne({})
    // console.log("token is :",token);
    const SECRET_KEY=process.env.SECRET_KEY

if(!token){
  return(
  res.status(401).send("No token found")
  )
}
else{
 const jwtverified= jwt.verify(token, SECRET_KEY)
 const rootuser = await User.findOne({_id:jwtverified._id,"tokens.token":token})
// console.log("done",jwtverified)

if(!rootuser){
  return res.status(401).send("Invalid token")
}
else{
  return res.status(201).send("Token Verified")
  next();

}

}

    // console.log(key)

  }
    catch(err){
      {console.log(err)}
    }
  }
  

app.get("/",function (req, res) {
    res.send("backend server created");
  });

  app.post("/signup", async function (req, res) {
    // res.send("backend server created");
  try{
  //  const {username,email,password,employeid,phone,address} = req.body;

  const username = req.body.username
  const email  = req.body.email
  const password  = req.body.password
  const employeid  = req.body.employeid
  const phone  = req.body.phone
  const address  = req.body.address

  //  const confirmhashedpassword= await genhashedpassword(password)

  //  const isUserExist= await Client.db("B33WD").collection("users").findOne({username:username})


const isUserExist = await User.findOne({username:username})

   if(isUserExist){
    res.status(400).send({msg:"try new username"});
    // window.alert("Try new userid")
   }else{

    const NewUser = new User (
      {
        username:username,
        email:email,
        password:password,
        employeid:employeid,
        phone:phone,
        address:address,
      }
    )

    await NewUser.save()

// const result = await Client.db("B33WD").collection("users").insertOne({username:username,email:email,employeid:employeid,phone:phone,address:address,password:confirmhashedpassword,})

res.status(200).send("successfully reg")

   }
  }
  catch(err){
    console.log(err)
  }

// console.log(isUserExist)

  });


app.post("/sigin",async function(req,res){
  try{
  const {username,password}=req.body;

 const user = await User.findOne({username:username})

  // const userfromdb = await Client.db("B33WD").collection("users").findOne({username:username})
  // const dbpassword=userfromdb.password;
  // console.log("userdata :",userfromdb)
  
  // localStorage = new LocalStorage('./scratch');

  if(!user){
     res.status(400).send({
      msg:"signup plz,Invalid credentials"
     })
  }
  else{
    const alreadystoredpassword=user.password;
    const ispasswordmatch=  await bcrypt.compare(password,alreadystoredpassword)
    // name: localStorage.getItem("name"),

    // localStorage.setItem("id", id);
    if(ispasswordmatch){

     
      const token = await user.generateValidToken()

      // const token=jwt.sign({id:userfromdb._id},SECRET_KEY)
     



      // globle.localStorage= new LocalStorage("./scratch")


    //  localStorage.setItem("x_auth_tokens",token);
    //  console.log(localStorage.getItem("x_auth_tokens"))

    // Storage.setState({
    //   x_auth_token:"token"
    // })

    // const name=userfromdb.username
// console.log(token)
    //  const add= await Client.db("B33WD").collection("users").updateOne({_id:userfromdb._id},{ $set:{
    //   username:userfromdb.username,email:userfromdb.email,employeid:userfromdb.employeid,phone:userfromdb.phone,address:userfromdb.address,password:userfromdb.password,tokens:token
    //  } })
// const add = await Client.db("B33WD").collection("users").updateOne({_id:userfromdb._id},{$set:userfromdb , tokens:token})


      // console.log("local",local)
      // localStorage= new LocalStorage("./scratch")
      // store.set("token",{token:"dd",token})
      // console.log("token is:",store.get("token"))
      res.cookie("token",token,{
        expires:new Date(Date.now() + 86000000),
        httpOnly:true,
        secure: true,
        sameSite: "none",
      })
      res.status(200).send(
        {
          msg:"successful login"
        }
      )
      // console.log("cookietoke",req.cookies.token)
      // console.log("successfull login",token)
    }else{
      res.status(400).send({
        msg:"password worng ,invalid "
      })
      console.log("password incorrect")
    }

// res.send(ispasswordmatch)
  }
}
catch(err){
  res.status(400).send("errda :")
}
} )



app.get("/logout",async (req,res)=>{
  
//  auth()
  res.clearCookie("token",{path:"/",httpOnly:true,secure:true,sameSite:"none"});
  res.status(200).send("user logout successfull")

})

app.get("/auth",auth,async (req,res)=>{

} )


app.post("/addadmin",async (req,res)=>{
  // const {username,password}=req.body
const username = req.body.username
const password = req.body.password


const isAdminExist = await Admin.findOne({username:username})

   if(isAdminExist){
    res.status(400).send({msg:"try new username"});
    // window.alert("Try new userid")
   }else{

    const NewAdmin = new Admin (
      {
        username:username,
       
        password:password,
       
      }
    )

    await NewAdmin.save()
   }

  // const confirmhashedpassword= await genhashedpassword(password)
  // const result = await Client.db("B33WD").collection("Admin").insertOne({username:username,password:confirmhashedpassword,}) 
// res.send(result)

  }
)

app.post("/adminlogin",async function (req,res){
  
//   try{
  // const {username,password}=req.body;
  // const userfromdb = await Client.db("B33WD").collection("Admin").findOne({username:username})
//   console.log(userfromdb)
  // res.send(userfromdb)
// }
// catch(err){
//   console.log(err.msg)
// }
// res.send("hii")
// })
  try{
  const {username,password}=req.body;
// console.log(username,password)
// const username=req.body.username;
// const password=req.body.password

  // const userfromdb = await Client.db("B33WD").collection("Admin").findOne({username:username})
  
  const AdminExist= await Admin.findOne({username:username})
 
// console.log("l")


  if(!AdminExist){
     res.status(400).send({
      msg:"u r not an Admin,Invalid credentialss"
     })
  }
  else{
    const alreadystoredpassword=AdminExist.password;
    const ispasswordmatch=  await bcrypt.compare(password,alreadystoredpassword)

    
   
    if(ispasswordmatch){
   
         const token = await AdminExist.generateValidToken()
      // const token=jwt.sign({id:userfromdb._id},SECRET_KEY)
    

      res.cookie("token",token,{
        expires:new Date(Date.now() + 36000),
        httpOnly:true,
        secure: true,
        sameSite: "none",
      })
      res.status(200).send(
        {
          msg:"successful login"
        }
      )

    }else{
      res.status(400).send({
        msg:"password worng ,invalid "
      })
      console.log("password incorrect")
    }

  }
}
catch(err){
  res.status(400).send("Err da")
}
} )


app.post("/accept/:id",async function(req,res){
  const id = req.params.id
  try{
    const {food,notes,img,Date,Time,username,OrderId}=req.body;

const Data = new AcceptedTokens (
  {
     username:username,
     foodName:food,
     description:notes,
     img:img,
     Date:Date,
     Time:Time,
     OrderId:OrderId

  }
)

await Data.save();

    // const data = await Client.db("B33WD").collection("AcceptedToken").insertOne({userName:username,Food:food,Notes:notes,Date:Date,Time:Time,Orderid:OrderId})
  if(Data){

    const accepted= await PendingTokens.findByIdAndDelete(id)

    //  const accepted = await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
     if(accepted){
      res.send("accepted and deleted from pending list successfully")
     }else{
      console.log("accepted but can't delete from pending list")
     }
  }else{
    console.log("can't accept the token, something went worng")
  }
  }catch(err){
    console.log(err)
  }
})
app.post("/reject/:id",async function(req,res){
  const id = req.params.id
  try{
    const {food,notes,Date,img,Time,username}=req.body;
    const Data = new RejectedTokens({
      username:username,
      foodName:food,
      description:notes,
      img:img,
      Date:Date,
      Time:Time

    })
    await Data.save()
    // const data = await Client.db("B33WD").collection("RejectedToken").insertOne({userName:username,Food:food,Notes:notes,Date:Date,Time:Time})
  if(Data){
  
    const rejected=await PendingTokens.findByIdAndDelete(id)

    //  const rejected = await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
     if(rejected){
      res.send("rejected and deleted from pending list successfully")
     }else{
      console.log("rejected but can't delete from pending list")
     }
  }else{
    console.log("can't reject the token, something went worng")
  }
  }catch(err){
    console.log(err)
  }
})

app.get("/getfoods",async function(req,res){
  try{

    const data = await Foods.find({})

    // const data = await Client.db("B33WD").collection("Foods").find({}).toArray()
    res.send(data)
  }catch(err){
    console.log(err)
  }
})
app.get("/getpendingTokens",async function(req,res){
  try{

    const data=await PendingTokens.find()

    // const data = await Client.db("B33WD").collection("pendingToken").find({}).toArray()
    res.send(data)
  }catch(err){
    console.log(err)
  }
})
app.get("/acceptedTokens",async function(req,res){
  try{
    // const data = await Client.db("B33WD").collection("AcceptedToken").find({}).toArray()
const data = await AcceptedTokens.find({})

    res.send(data)
  }catch(err){
    console.log(err)
  }
})
app.get("/rejectedTokens",async function(req,res){
  try{
const data = await RejectedTokens.find({})

    // const data = await Client.db("B33WD").collection("RejectedToken").find({}).toArray()
    res.send(data)
  }catch(err){
    console.log(err)
  }
})

app.delete("/cancelToken/:id",async function(req,res){

const id = req.params.id

  try{
    
    const cancelToken=await PendingTokens.findOneAndDelete(id)

// const deletetoken= await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
res.send("Cancelled successfully")
  }
  catch(err){
    console.log(err)
  }
})


app.get("/profile/:id",async function(req,res){
  const id = req.params.id
  // console.log(id)
  try{

       const data = await User.findOne({username:id})

    // res.send("ok")
    // const data = await Client.db("B33WD").collection("users").findOne({username:id})
  // console.log(data)
    res.send(data)
  }catch(err){
    console.log(err)
  }
})



app.get("/foods/:id",async function(req,res){
// app.get("/foods/:id",async function(req,res){
  const  id  = req.params.id;
  try{

    const idfood = await Foods.findById(id)

    // const data = await Client.db("B33WD").collection("Foods").findOne({foodName:"rice"})
    // const data = await Client.db("B33WD").collection("Foods").findOne({_id:ObjectId(id)})
    // res.send(data)
    // console.log(data)

    idfood?res.send(idfood):res.send("no food found")
  }catch(err){
    console.log(err)
  }
})




app.post("/addnewfood", async function (req, res) {
  try{
//  const {food,notes,img} = req.body;

const food= req.body.food;
const notes= req.body.notes;
const img= req.body.img;
// console.log(food,notes,img)

 const isFoodExist = await Foods.findOne({foodname:food})

//  console.log(isFoodExist)


//  const isFoodExist= await Client.db("B33WD").collection("Foods").findOne({foodName:food})
//  console.log("food247",isFoodExist)
 if(isFoodExist){
   return res.status(401).send({msg:"Already added"});

 }
//  else{
  const NewFood= new Foods(
    {
      foodname:food,
      description:notes,
      img:img
    }
  )

  await NewFood.save()
// const result = await Client.db("B33WD").collection("Foods").insertOne({foodName:food,Notes:notes})
res.status(200).send("Added successfully")
//  }
  }catch(err){
    console.log(err)
  }

});
app.put("/updatefood/:id", async function (req, res) {
  try{
    const  id =req.params.id;
// console.log(id)
    // const  foodname=
    // const  notes=
    // const  img=

const Updated= await Foods.findByIdAndUpdate(id)
Updated.foodname=req.body.foodName;
Updated.description=req.body.Notes
Updated.img=req.body.img

await Updated.save()
   
// console.log(id);

//  const data= req.body;

//  const data1 = await Client.db("B33WD").collection("Foods").updateOne({_id:ObjectId(id)},{$set:data})

res.status(200).send("updated successfully")


  }catch(err){
    console.log("err da")
  }

});

app.post("/request/:id",async function(req,res){
  try{


  const date=new Date();
  const day=("0" + date.getDate()).slice(-2);
  const month=("0" + ( date.getMonth() + 1)).slice(-2);
  const year=( date.getFullYear())
 
  const hours=(date.getHours())
  const min=("0" +date.getMinutes()).slice(-2)
 //  const min=(date.getMinutes())
  const sec=(date.getSeconds())
 const NowTime=(hours + ":" + min +":" + sec)
 
  const full_date=(day + "-" + month + "-" + year)

  const id = req.params.id
const userName=req.body.userName
const foodname=req.body.foodName
const description=req.body.notes
const img=req.body.img

const data=await Foods.findById(id)


// console.log(foodname,description,img)


    // const data = await Client.db("B33WD").collection("Foods").findOne({_id:ObjectId(id)})
    // console.log(data)

    if(data){

      
      // const foodName=foodname
      // const description=description
      // const img=img
      const Date=full_date
      const Time=NowTime

      const Orderplaced= new PendingTokens(
        {
          username:userName,
          Foodname:foodname,
          description:description,
          img:img,
          Date:Date,
          Time:Time
        }
      )

      // console.log("Order :",Orderplaced)

      await Orderplaced.save()
            
         

      // const request= await Client.db("B33WD").collection("pendingToken").insertOne({userName:userName,foodName:data.foodName,Notes:data.Notes,Date:full_date,Time:NowTime})
      res.status(200).send("Ordered successfully")
    }else{
      res.status(400).send("something went worng")
    }

  }catch(err){
console.log(err)
  }
})



app.delete("/deletefood/:id", async function (req, res) {
  try{
    const  id =req.params.id;
// console.log(id);
// const data1 = await Client.db("B33WD").collection("Foods").deleteOne({_id:ObjectId(id)})

 const DFood= await Foods.findByIdAndDelete(id) 
   const DeleteFood=await DFood.remove()
res.status(200).send("deleted successfully")


  }catch(err){
    console.log(err.msg)
  }

});
app.delete("/deleteacceptedlist/:id", async function (req, res) {
  try{
    const  id =req.params.id;
// console.log(id);

const Data = await AcceptedTokens.findByIdAndDelete(id)

// const data1 = await Client.db("B33WD").collection("AcceptedToken").deleteOne({_id:ObjectId(id)})

res.status(200).send("deleted")


  }catch(err){
    console.log(err.msg)
  }

});
app.delete("/deleterejectedlist/:id", async function (req, res) {
  try{
    const { id }=req.params;
// console.log(id);

const data = await RejectedTokens.findByIdAndDelete(id)
// const data1 = await Client.db("B33WD").collection("RejectedToken").deleteOne({_id:ObjectId(id)})

res.status(200).send("deleted")


  }catch(err){
    console.log(err.msg)
  }

});




// app.post("/addfoodsss",async (req,res)=>{

//   // res.send("hy")
// try{
// // const {food,notes} =req.body;

// // const CheckItem=Client.db("B33WD").collection("Foods").findOne({food:food})

// // console.log(CheckItem)

// // if(CheckItem){
//   // res.status(401).send("Food Already Added")
// // }
// // else{
// const Added= await Client.db("B33WD").collection("Foods").insertOne({Food:food,Notes:notes,})
 
// res.send(Added)


// // if(Added){
//   // res.status(200).send("Food Added Successfully")
// // }

// // else{
//   // res.status(400).send("Can't Add Food")
// // }
// // }

// }
// catch(err){
//   console.log(err)
// }

// })


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



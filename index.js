import express from "express";
import urlencoded from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import cookieParser from "cookie-parser";
import { LocalStorage } from "node-localstorage";

import mongoose from "mongoose";
import { User } from "./components/users/Schema/userSchema";
import { Admin } from "./components/users/Schema/adminSchema";
import { Foods } from "./components/users/Schema/FoodSchema";
import { PendingTokens } from "./components/users/Schema/PendingTokenSchema";
import { AcceptedTokens } from "./components/users/Schema/AcceptedTokenSchema";
import { RejectedTokens } from "./components/users/Schema/RejectedTokenSchema";

// import { LocalStorage } from "node-localstorage";

// https://www.youtube.com/watch?v=enopDSs3DRw

const app = express();

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://mycapston.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// app.use(express.urlencoded({extended:false}))
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const MONGO_URL = process.env.MONGO;

const SECRET_KEY = process.env.SECRET_KEY;

// async function Createconnection() {
//     const Client = new MongoClient(MONGO_URL);
//     await Client.connect();
//     console.log(`Mongo connected on ${PORT}`);
//     return Client;
//   }

const Createconnection = async () => {
  try {
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.log(err);
  }
};

export const Client = await Createconnection();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    //Another type of method to get token
    // const token=req.header('Authorization').replace('Bearer ', "")
    // const token = await Client.db("B33WD").collection("users").findOne({})
    const SECRET_KEY = process.env.SECRET_KEY;

    if (!token) {
      return res.status(401).send("No token found");
    } else {
      // verifing the token which is valid or not
      const jwtverified = jwt.verify(token, SECRET_KEY);
      //  finding the user from MongoDB
      const rootuser = await User.findOne({
        _id: jwtverified._id,
        "tokens.token": token,
      });
      if (!rootuser) {
        return res.status(401).send("Invalid token");
      } else {
        return res.status(201).send("Token Verified");
        next();
      }
    }

    // console.log(key)
  } catch (err) {
    {
      console.log(err);
    }
  }
};

app.get("/", function (req, res) {
  res.send("backend server created");
});

app.post("/signup", async function (req, res) {
  try {
    //  const {username,email,password,employeid,phone,address} = req.body;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const employeid = req.body.employeid;
    const phone = req.body.phone;
    const address = req.body.address;

    // MongoDB commends .
    //  const confirmhashedpassword= await genhashedpassword(password)
    //  const isUserExist= await Client.db("B33WD").collection("users").findOne({username:username})

    const isUserExist = await User.findOne({ username: username });

    if (isUserExist) {
      res.status(400).send({ msg: "try new username" });
      // window.alert("Try new userid")
    } else {
      // Adding new user
      const NewUser = new User({
        username: username,
        email: email,
        password: password,
        employeid: employeid,
        phone: phone,
        address: address,
      });

      await NewUser.save();

      //MongoDB commend for adding new user
      // const result = await Client.db("B33WD").collection("users").insertOne({username:username,email:email,employeid:employeid,phone:phone,address:address,password:confirmhashedpassword,})

      res.status(200).send("successfully reg");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/sigin", async function (req, res) {
  try {
    const { username, password } = req.body;
    //finding the user in Mongo DB
    const user = await User.findOne({ username: username });
    // MongoDB commends to find user in mongodb
    // const userfromdb = await Client.db("B33WD").collection("users").findOne({username:username})
    // const dbpassword=userfromdb.password;
    if (!user) {
      res.status(400).send({
        msg: "signup plz,Invalid credentials",
      });
    } else {
      const alreadystoredpassword = user.password;
      const ispasswordmatch = await bcrypt.compare(
        password,
        alreadystoredpassword
      );
      if (ispasswordmatch) {
        // generating the token
        const token = await user.generateValidToken();

        res.cookie("token", token, {
          expires: new Date(Date.now() + 86000000),
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        res.status(200).send({
          msg: "successful login",
        });
      } else {
        res.status(400).send({
          msg: "password worng ,invalid ",
        });
        console.log("password incorrect");
      }
    }
  } catch (err) {
    res.status(400).send("errda :");
  }
});

app.get("/logout", async (req, res) => {
  //  Clearing the Cookies
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).send("user logout successfull");
});

app.get("/auth", auth, async (req, res) => {});

app.post("/addadmin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // finding the client is Admin are not
  const isAdminExist = await Admin.findOne({ username: username });

  if (isAdminExist) {
    res.status(400).send({ msg: "try new username" });
  } else {
    // Adding new Admin
    const NewAdmin = new Admin({
      username: username,

      password: password,
    });

    await NewAdmin.save();
  }

  // Addding Admin by using MongoDB commends
  // const result = await Client.db("B33WD").collection("Admin").insertOne({username:username,password:confirmhashedpassword,})
  // res.send(result)
});

app.post("/adminlogin", async function (req, res) {
  try {
    const { username, password } = req.body;

    // Finding the client in admin collection by using mongo db commend
    // const userfromdb = await Client.db("B33WD").collection("Admin").findOne({username:username})

    const AdminExist = await Admin.findOne({ username: username });

    if (!AdminExist) {
      res.status(400).send({
        msg: "u r not an Admin,Invalid credentialss",
      });
    } else {
      const alreadystoredpassword = AdminExist.password;
      const ispasswordmatch = await bcrypt.compare(
        password,
        alreadystoredpassword
      );

      if (ispasswordmatch) {
        const token = await AdminExist.generateValidToken();
        // Making the token and send back in cookies
        res.cookie("token", token, {
          expires: new Date(Date.now() + 36000),
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        res.status(200).send({
          msg: "successful login",
        });
      } else {
        res.status(400).send({
          msg: "password worng ,invalid ",
        });
        console.log("password incorrect");
      }
    }
  } catch (err) {
    res.status(400).send("Err da");
  }
});

app.post("/accept/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const { food, notes, img, Date, Time, username, OrderId } = req.body;

    const Data = new AcceptedTokens({
      username: username,
      foodName: food,
      description: notes,
      img: img,
      Date: Date,
      Time: Time,
      OrderId: OrderId,
    });

    await Data.save();
    //Adding details in acceted list by using mongoDB commends
    // const data = await Client.db("B33WD").collection("AcceptedToken").insertOne({userName:username,Food:food,Notes:notes,Date:Date,Time:Time,Orderid:OrderId})
    if (Data) {
      const accepted = await PendingTokens.findByIdAndDelete(id);

      //  const accepted = await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
      if (accepted) {
        res.send("accepted and deleted from pending list successfully");
      } else {
        console.log("accepted but can't delete from pending list");
      }
    } else {
      console.log("can't accept the token, something went worng");
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/reject/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const { food, notes, Date, img, Time, username } = req.body;
    const Data = new RejectedTokens({
      username: username,
      foodName: food,
      description: notes,
      img: img,
      Date: Date,
      Time: Time,
    });
    await Data.save();
    // const data = await Client.db("B33WD").collection("RejectedToken").insertOne({userName:username,Food:food,Notes:notes,Date:Date,Time:Time})
    if (Data) {
      const rejected = await PendingTokens.findByIdAndDelete(id);

      //  const rejected = await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
      if (rejected) {
        res.send("rejected and deleted from pending list successfully");
      } else {
        console.log("rejected but can't delete from pending list");
      }
    } else {
      console.log("can't reject the token, something went worng");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/getfoods", async function (req, res) {
  try {
    const data = await Foods.find({});

    // const data = await Client.db("B33WD").collection("Foods").find({}).toArray()
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});
app.get("/getpendingTokens", async function (req, res) {
  try {
    const data = await PendingTokens.find();

    // const data = await Client.db("B33WD").collection("pendingToken").find({}).toArray()
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});
app.get("/acceptedTokens", async function (req, res) {
  try {
    // const data = await Client.db("B33WD").collection("AcceptedToken").find({}).toArray()
    const data = await AcceptedTokens.find({});

    res.send(data);
  } catch (err) {
    console.log(err);
  }
});
app.get("/rejectedTokens", async function (req, res) {
  try {
    const data = await RejectedTokens.find({});

    // const data = await Client.db("B33WD").collection("RejectedToken").find({}).toArray()
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/cancelToken/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const cancelToken = await PendingTokens.findOneAndDelete(id);

    // const deletetoken= await Client.db("B33WD").collection("pendingToken").deleteOne({_id:ObjectId(id)})
    res.send("Cancelled successfully");
  } catch (err) {
    console.log(err);
  }
});

app.get("/profile/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const data = await User.findOne({ username: id });

    // const data = await Client.db("B33WD").collection("users").findOne({username:id})
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

app.get("/foods/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const idfood = await Foods.findById(id);

    // const data = await Client.db("B33WD").collection("Foods").findOne({foodName:"rice"})
    // const data = await Client.db("B33WD").collection("Foods").findOne({_id:ObjectId(id)})

    idfood ? res.send(idfood) : res.send("no food found");
  } catch (err) {
    console.log(err);
  }
});

app.post("/addnewfood", async function (req, res) {
  try {
    const food = req.body.food;
    const notes = req.body.notes;
    const img = req.body.img;

    const isFoodExist = await Foods.findOne({ foodname: food });

    //  const isFoodExist= await Client.db("B33WD").collection("Foods").findOne({foodName:food})
    if (isFoodExist) {
      return res.status(401).send({ msg: "Already added" });
    }
    //  else{
    const NewFood = new Foods({
      foodname: food,
      description: notes,
      img: img,
    });

    await NewFood.save();
    // const result = await Client.db("B33WD").collection("Foods").insertOne({foodName:food,Notes:notes})
    res.status(200).send("Added successfully");
    //  }
  } catch (err) {
    console.log(err);
  }
});
app.put("/updatefood/:id", async function (req, res) {
  try {
    const id = req.params.id;

    const Updated = await Foods.findByIdAndUpdate(id);
    Updated.foodname = req.body.foodName;
    Updated.description = req.body.Notes;
    Updated.img = req.body.img;

    await Updated.save();

    //  const data1 = await Client.db("B33WD").collection("Foods").updateOne({_id:ObjectId(id)},{$set:data})

    res.status(200).send("updated successfully");
  } catch (err) {
    console.log("err da");
  }
});

app.post("/request/:id", async function (req, res) {
  try {
    const date = new Date();
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();

    const hours = date.getHours();
    const min = ("0" + date.getMinutes()).slice(-2);
    const sec = date.getSeconds();
    const NowTime = hours + ":" + min + ":" + sec;

    const full_date = day + "-" + month + "-" + year;

    const id = req.params.id;
    const userName = req.body.userName;
    const foodname = req.body.foodName;
    const description = req.body.notes;
    const img = req.body.img;

    const data = await Foods.findById(id);

    // const data = await Client.db("B33WD").collection("Foods").findOne({_id:ObjectId(id)})

    if (data) {
      const Date = full_date;
      const Time = NowTime;

      const Orderplaced = new PendingTokens({
        username: userName,
        Foodname: foodname,
        description: description,
        img: img,
        Date: Date,
        Time: Time,
      });

      await Orderplaced.save();

      // const request= await Client.db("B33WD").collection("pendingToken").insertOne({userName:userName,foodName:data.foodName,Notes:data.Notes,Date:full_date,Time:NowTime})
      res.status(200).send("Ordered successfully");
    } else {
      res.status(400).send("something went worng");
    }
  } catch (err) {
    console.log(err);
  }
});

app.delete("/deletefood/:id", async function (req, res) {
  try {
    const id = req.params.id;
    // const data1 = await Client.db("B33WD").collection("Foods").deleteOne({_id:ObjectId(id)})

    const DFood = await Foods.findByIdAndDelete(id);
    const DeleteFood = await DFood.remove();
    res.status(200).send("deleted successfully");
  } catch (err) {
    console.log(err.msg);
  }
});
app.delete("/deleteacceptedlist/:id", async function (req, res) {
  try {
    const id = req.params.id;

    const Data = await AcceptedTokens.findByIdAndDelete(id);

    // const data1 = await Client.db("B33WD").collection("AcceptedToken").deleteOne({_id:ObjectId(id)})

    res.status(200).send("deleted");
  } catch (err) {
    console.log(err.msg);
  }
});
app.delete("/deleterejectedlist/:id", async function (req, res) {
  try {
    const { id } = req.params;

    const data = await RejectedTokens.findByIdAndDelete(id);
    // const data1 = await Client.db("B33WD").collection("RejectedToken").deleteOne({_id:ObjectId(id)})

    res.status(200).send("deleted");
  } catch (err) {
    console.log(err.msg);
  }
});

app.listen(PORT, () => console.log(`App started in ${PORT}`));

async function genhashedpassword(password) {
  const rounds = 10;
  const salt = await bcrypt.genSalt(rounds);
  // console.log(salt,"this is salt")
  const hashedpassword = await bcrypt.hash(password, salt);
  // console.log("hassed",hashedpassword);
  return hashedpassword;
}

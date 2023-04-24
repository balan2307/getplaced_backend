const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../cloudinary");
var mongoose = require('mongoose');
// const User = require("../models/User");

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;


  User.findOne({ email }, (err, user) => {


    if (err)
      return res.status(500).json({
        title: "server error",
        error: err,
      });

    if (!user) {
      return res.status(401).json({
        title: "user not found",
        error: "invalid credentials",
      });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        title: "login failed",
        error: "invalid credentials",
      });
    }

    let token = jwt.sign({ userId: user._id }, "secretkey", {
      expiresIn: "6d",
    });
  
    return res.status(200).json({
      title: "login success",
      token,
      uid: user._id,
      username:user.username
    });
  });
};

module.exports.RegisterUser = async (req, res) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let date = new Date().toLocaleString();
  // let time=Date.now();

  let month = months[parseInt(date.split(" ")[0].split("/")[0]) - 1];
  let year = date.split(" ")[0].split("/")[2].split(",")[0];
  let joined = month + " " + year;
  const { email, username, password } = req.body;
  const newUser = new User({
    email,
    username,
    password: bcrypt.hashSync(password, 10),
    joined,
  });

  newUser.save((err) => {
    if (err) {
      const duplicate = err.keyPattern;

      if ("email" in duplicate) {
        return res.status(400).json({
          title: "error",
          error: "An account with this email already exists ,try login",
        });
      } else if ("username" in duplicate) {
        return res.status(400).json({
          title: "error",
          error: "username already in use,try a different one",
        });
      }
    }

    return res.status(200).json({
      title: "signup success",
    });
  });


};

module.exports.getAllUsers = async (req, res) => {
  const users = await User.find({ email: "thevarbalan32@gmail.com" });
  return res.status(200).json({
    title: "Test success",
  });

};

module.exports.getUserName = async (req, res) => {

  const { id } = req.params;
  const user = await User.findOne({ _id: id });

  return res.status(200).json({
    title: "Success",
    username: user.username,
  });

};

module.exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  let filename = "";
  let path = "";
  let profileImage = "";
  console.log("prof upd",req.body)
  if(id!=res.locals.user)
  {
      console.log("backend unauth access")
      return res.status(401).json({
          title:"Unauthorized access",
        
        })

  }



  const {
    name,
    username,
    college,
    university,
    yearofgraduation: yearofgrad,
    image,
    bio,
    imagedeletion
  } = req.body;

  const getUser = await User.findOne({ _id: id });

  if (req.file) {
 
    filename = req.file.filename;
    path = req.file.path;
    profileImage = { url: path, filename };

      if ( getUser.profileImage != undefined && getUser.profileImage.filename != undefined) 
      {

        try{ await cloudinary.uploader.destroy(getUser.profileImage.filename);}
        catch(err)
        {
          return res.status(400).json({
            title: "Error",
            message:"Server error"
          });

        }  }

      try
      {  
    
       const user=  await User.findByIdAndUpdate(
        id,
        { name, username, college, university, yearofgrad, profileImage, bio },
        { new: true }
      );
  

         if(user){

        
          return res.status(200).json({
        title: "update success",

        updatedprofile:user
      });
    }
    }
    catch(err)
    {
      return res.status(400).json({
        title: "Error",
        message:"Username already taken ,choose a different one"
      });

    }

   
      
   
  } else {
  
    if(imagedeletion=="true"){

      try
      {
    
     if(getUser.profileImage.filename) await cloudinary.uploader.destroy(getUser.profileImage.filename);
      }
      catch(err)
      {
        console.log("cloudin err",err)
      }
    }
    try{
   
     let user="";
     if(imagedeletion=="true")
     {
  
      let profileImage={};
     user=await User.findByIdAndUpdate(
        id,
        { name, username, college, university, yearofgrad, bio ,profileImage},
        { new: true }

      );
     }
     else
     {


      user=await User.findByIdAndUpdate(
         id,
         { name, username, college, university, yearofgrad, bio},
         { new: true }
 
       );

     }


      if(user) {
   
        return res.status(200).json({
        title: "update success",
        updatedprofile:user
      });
    }
      
    }
    catch(err)
    {
      return res.status(400).json({
        title: "Error",
        message:"Username already taken ,choose a different one"
      });

      
    }



  }
};

module.exports.getUserProfile = async (req, res) => {
  

  const { id } = req.params;
  let profile ={}
  try{


    if(!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error();
     }
    profile =await User.findOne({ _id: id });
    if(profile.length==0) throw new Error();
    

  }
  catch(err)
  {

    return res.status(404).json({
      title:"Page not found"
    })

  }



  return res.status(200).json({
    title: "Success",
    profile,
  });
};

module.exports.deleteProfileImage = async (req, res) => {
  const { id } = req.params;
  const profile = await User.findOne({ _id: id });
  try {

    if (
      profile.profileImage != undefined &&
      profile.profileImage.filename != undefined
    )
      await cloudinary.uploader.destroy(profile.profileImage.filename);
    await User.findByIdAndUpdate(id, { profileImage: {} }, { new: true });
  } catch (err) {
    console.log("Error", err);
  }
};

module.exports.checkUnique = async (req, res) => {
  const { email, username } = req.query;

  if (email) {
    try {
      const user = await User.findOne({ email });

    } catch (err) {
      console.log("Error", err);
    }
  } else if (username) {
    const user = await User.findOne({ username });

  }
};


module.exports.verifyToken=async(req,res)=>{

   let {token}=req.params


  if (!token) {
  
    return res.status(403).json({
      title: "error",
 
    });
  }
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    return res.status(200).json({
      title: "auth success",
 
    });
  } catch (err) {
 
    return res.status(403).json({
      title: "error",
      error: "token is invalid",
    });
  
  }






  
}
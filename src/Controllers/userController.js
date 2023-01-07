const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../cloudinary");
// const User = require("../models/User");

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("In Login", email, password);

  User.findOne({ email }, (err, user) => {
    console.log("User received", user);

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
    console.log("login success");
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

  let month = months[parseInt(date.split(" ")[0].split("/")[1]) - 1];
  let year = date.split(" ")[0].split("/")[2].split(",")[0];
  console.log("month", "year", month, year);
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
          error: "email in use",
        });
      } else if ("username" in duplicate) {
        return res.status(400).json({
          title: "error",
          error: "username in use",
        });
      }
    }

    return res.status(200).json({
      title: "signup success",
    });
  });

  console.log("Register request received", newUser);
};

module.exports.getAllUsers = async (req, res) => {
  const users = await User.find({ email: "thevarbalan32@gmail.com" });
  console.log("testing", users);
  return res.status(200).json({
    title: "Test success",
  });
  // return users
};

module.exports.getUserName = async (req, res) => {
  // console.log("testing username before")
  const { id } = req.params;
  const user = await User.findOne({ _id: id });
  // console.log("testing username",user.username)
  return res.status(200).json({
    title: "Success",
    username: user.username,
  });
  // return users
};

module.exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  let filename = "";
  let path = "";
  let profileImage = "";

  console.log("backend prof", req.body);

  //  function isEmpty(obj) {
  //   console.log("OBJ ",obj,Object.keys(obj).length)

  //   return Object.keys(obj).length === 0;
  // }

  const {
    name,
    username,
    college,
    university,
    yearofgraduation: yearofgrad,
    image,
    bio,
  } = req.body;
  const getUser = await User.findOne({ _id: id });
  //  console.log("ID profile",id,getUser.profileImage,typeof(getUser.profileImage))
  console.log("Bio ", bio);

  if (req.file) {
    console.log("Image  uploaded");
    filename = req.file.filename;
    path = req.file.path;
    profileImage = { url: path, filename };

      if (
        getUser.profileImage != undefined &&
        getUser.profileImage.filename != undefined
      ) {
        console.log("Entered if");
        try{ await cloudinary.uploader.destroy(getUser.profileImage.filename);}
        catch(err)
        {
          return res.status(400).json({
            title: "Error",
            message:"Server error"
          });

        }
       
      }

      try
      {   await User.findByIdAndUpdate(
        id,
        { name, username, college, university, yearofgrad, profileImage, bio },
        { new: true }
      );
    }
    catch(err)
    {
      return res.status(400).json({
        title: "Error",
        message:"Username already taken ,choose a different one"
      });

    }
   
      
   
  } else {
    console.log("Image not uploaded");
    // await cloudinary.uploader.destroy(getUser.profileImage.filename);
    try{
      await User.findByIdAndUpdate(
        id,
        { name, username, college, university, yearofgrad, bio },
        { new: true }
      );
      
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
  const profile = await User.findOne({ _id: id });
  // console.log("Profile backend",profile)
  return res.status(200).json({
    title: "Success",
    profile,
  });
};

module.exports.deleteProfileImage = async (req, res) => {
  const { id } = req.params;
  const profile = await User.findOne({ _id: id });
  try {
    console.log("Deleting prof image", profile.profileImage.filename);
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
  console.log("email", email, username);
  if (email) {
    try {
      const user = await User.findOne({ email });
      console.log("Email ", user, email);
    } catch (err) {
      console.log("Error", err);
    }
  } else if (username) {
    const user = await User.findOne({ username });
    console.log("Username ", user);
  }
};

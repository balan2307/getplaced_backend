const express = require("express");
const router = express.Router();
const UserController=require('../Controllers/userController')
const User=require('../models/User')
const {storage}=require('../cloudinary/index')
const multer  = require('multer')
const upload = multer({ storage })

router.route('/login')
.post(UserController.loginUser);


router.route('/register')
.post(UserController.RegisterUser);

router.route('/username/:id')
.get(UserController.getUserName);

router.route('/profile/:id')
.get(UserController.getUserProfile)
.post(upload.single('image'),UserController.updateProfile)

router.route('/users')
.get(UserController.getAllUsers)

router.route('/validate')
.get(UserController.checkUnique)
router.route('/deleteImage/:id')
.post(UserController.deleteProfileImage)

module.exports=router;



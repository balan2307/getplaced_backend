const express = require("express");
const router = express.Router();
const UserController=require('../Controllers/userController')

router.route('/login')
.post(UserController.loginUser);


router.route('/register')
.post(UserController.RegisterUser);

router.route('/authorize/:token')
.get(UserController.verifyToken)

module.exports=router;

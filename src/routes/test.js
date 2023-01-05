const express = require("express");
const router = express.Router();
const UserController=require('../Controllers/userController')


router.route('/users')
.get(UserController.getAllUsers)
module.exports=router;
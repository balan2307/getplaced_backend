const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema({
    name:String,
    username:{
        unique:true,
        type:String
    },
    email:{
        unique:true,
        type:String
    },
    bio:{
        type:String
    },
    password:String,
    university:String,
    yearofgrad:String,
    profileImage:{
        url:String,
        filename:String
    },
    joined:String,
    followers:Number,
    following:Number
    
})

const User=mongoose.model('User',userSchema);
module.exports=User;
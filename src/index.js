const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const dotenv=require('dotenv');

// const User=require('../models/User')
const app=express();
const mongoInit=require('./db/conn');
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
dotenv.config();
mongoInit()
const PORT=process.env.SERVER_PORT || 3000;




const InitRoutes=require('./routes/index');
InitRoutes(app);

app.use((req, res, next) => {
    console.log("request received from client");
    next(); // this will invoke next middleware function
})

// app.all('*', function(req, res){

//     console.log("request received in backend",req.url);
    
// });

app.listen(PORT ,()=>{
    console.log(`server started on PORT ${PORT}`)
})
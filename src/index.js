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





app.listen(PORT ,()=>{
    console.log(`server started on PORT ${PORT}`)
})
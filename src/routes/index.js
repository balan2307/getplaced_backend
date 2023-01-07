


const adminRouter=require('./user')
const testRouter=require('./test')
const postRouter=require('./post')
const authRouter=require('./auth')
const auth = require("../middleware/auth");

const InitRoutes = (app) => {


    
  app.use("/user/auth", authRouter)
  app.use("/user",auth, adminRouter)
  app.use('/',auth,postRouter)
  app.use('/test',testRouter)

  console.log("Routes Initialized Successfully")


}


module.exports=InitRoutes;

// app.listen(PORT ,()=>{s
//     console.log(`server started on PORT ${PORT}`)
// })
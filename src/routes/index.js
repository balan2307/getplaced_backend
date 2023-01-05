


const adminRouter=require('./user')
const testRouter=require('./test')
const postRouter=require('./post')
const auth = require("../middleware/auth");

const InitRoutes = (app) => {

    

  app.use("/user", adminRouter)
  app.use('/',postRouter)
  app.use('/test',testRouter)

  console.log("Routes Initialized Successfully")


}


module.exports=InitRoutes;

// app.listen(PORT ,()=>{s
//     console.log(`server started on PORT ${PORT}`)
// })
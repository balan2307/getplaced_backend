const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {



  console.log("request",req.url)
  let token =''

  if(req.headers.authorization!=undefined) token = req.headers.authorization.split(' ')[1];
  

  if (!token) {
    console.log("token not found",token,req.url)
  
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    res.locals.user=decoded.userId;
  } catch (err) {
    console.log("errror",err)

    return res.status(401).json({
      title: "error",
      error: "username already in use,try a different one",
    });
  
  }
  return next();
};

module.exports = verifyToken;
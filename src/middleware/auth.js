const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  console.log("middlleware called",req.url)


  const token = req.headers.authorization.split(' ')[1];
  // console.log("Backend token",token)
  

  if (!token) {
    console.log("token required")
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
  } catch (err) {
    console.log("Invalid token")
    return res.status(401).json({
      title: "error",
      error: "username already in use,try a different one",
    });
  
  }
  return next();
};

module.exports = verifyToken;
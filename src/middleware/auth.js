const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {



  let token =''

  if(req.headers.authorization!=undefined) token = req.headers.authorization.split(' ')[1];
  

  if (!token) {
  
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
  } catch (err) {

    return res.status(401).json({
      title: "error",
      error: "username already in use,try a different one",
    });
  
  }
  return next();
};

module.exports = verifyToken;
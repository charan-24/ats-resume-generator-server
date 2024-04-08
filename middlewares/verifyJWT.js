const jwt = require('jsonwebtoken');
const { prependOnceListener } = require('../database/database');

const verifyJWT = (req,res,next)=>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader){
        return res.sendStatus(401);
    }
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.SECRET_ACCESS_TOKEN,
        (err, decoded) => {
            if(err){
                return res.sendStatus(403);
            }
            req.user = decoded.username;
            next();
        }
    );
}

module.exports = verifyJWT;
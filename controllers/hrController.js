const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const hrLogin = asyncHandler(async(req,res)=>{
    const {username,password} = req.body;

    if(!username || !password){
        return res.status(400).json({message:"all fields required"});
    }

    const [foundUser] = await db.query('select hr_id, username, password, role from hraccounts where username = ? || email = ?',[username,username])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    console.log(foundUser[0]);
    if(!foundUser[0] || !foundUser[0].length){
        return res.status(401).json({message:"hr not found"});
    }
    const match = await bcrypt.compare(password,foundUser[0].password);
    console.log(password);
    if(match){
        const [logindate] = await db.query(`select curdate() as logindate`);
        const accessToken = jwt.sign(
            {"username": foundUser[0].username},
            process.env.SECRET_ACCESS_TOKEN,
            {expiresIn: '1d'}
        );

        const refreshToken =  jwt.sign(
            {"username": foundUser[0].username},
            process.env.SECRET_REFRESH_TOKEN,
            {expiresIn: '2d'}
        );
        const addrefreshtoken = await db.query(`update hraccounts set ? where hr_id = ?`,[{last_login:logindate[0].logindate,"refreshToken":refreshToken},foundUser[0].hr_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({accessToken});
    }
    
    return res.status(401).json({message:"unauthorized login"});
});

const hrRegister = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body;
    if(!username || !password || !email){
        return res.status(401).json({message:"all fields required"});
    }
    const [duplicate] = await db.query(`select * from hraccounts where username = ? || email = ?`,[username,email]);
    // console.log(duplicate[0]);
    if(duplicate[0]){
        return res.status(400).json({message:"duplicate hr entry found"});
    }

    const hashpassword = await bcrypt.hash(password,11);
    const hrobj = { 
        "username":username,
        "password":hashpassword,
        "email":email
    };
    const sqlregister = `insert into hraccounts set ?`;
    const register = await db.query(sqlregister,hrobj)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"hr created"});
});

module.exports = {
    hrRegister,
    hrLogin
}
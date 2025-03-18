const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = process.env.SALT_ROUNDS;

const hrLogin = asyncHandler(async(req,res)=>{
    const {emailorg,password} = req.body;

    if(!emailorg || !password){
        return res.status(400).json({message:"all fields required"});
    }

    const [foundHR] = await db.query('select hr_id, password, emailorg, role from hraccounts where emailorg = ?',[emailorg])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    if(!foundHR[0]){
        return res.status(401).json({message:"hr not found"});
    }
    const match = await bcrypt.compare(password,foundHR[0].password);
    if(match){
        const [logindate] = await db.query(`select curdate() as logindate`);
        const accessToken = jwt.sign(
            {"username": foundHR[0].emailorg},
            process.env.SECRET_ACCESS_TOKEN,
            {expiresIn: '1d'}
        );

        const refreshToken =  jwt.sign(
            {"username": foundHR[0].emailorg},
            process.env.SECRET_REFRESH_TOKEN,
            {expiresIn: '2d'}
        );
        const addrefreshtoken = await db.query(`update hraccounts set ? where hr_id = ?`,[{lastlogin:logindate[0].logindate,"refreshToken":refreshToken},foundHR[0].hr_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"success",accessToken,"userid":foundHR[0].hr_id,"role":foundHR[0].role});
    }
    
    return res.status(401).json({message:"wrongpwd"});
});

const hrRegister = asyncHandler(async(req,res)=>{
    const hrbody = req.body;
    console.log(req.body);
    if(!hrbody || Object.keys(hrbody).length<7){
        return res.status(401).json({message:"all fields required"});
    }
    const [duplicate0] = await db.query(`select * from hraccounts where emailorg = ?`,[hrbody.emailorg]);
    const [duplicate1] = await db.query(`select * from hraccounts where phonenumber = ?`,[hrbody.phonenumber]);

    // console.log(duplicate[0]);
    if(duplicate0[0]){
        return res.status(400).json({message:"emailorgerror"});
    }
    if(duplicate1[0]){
        return res.status(400).json({message:"numbererror"});
    }
    

    const hashpassword = await bcrypt.hash(hrbody.password,parseInt(saltRounds));
    hrbody["password"] = hashpassword;
    const sqlregister = `insert into hraccounts set ?`;
    const [register] = await db.query(sqlregister,hrbody)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"hr created","userid":register.insertId});
});

module.exports = {
    hrRegister,
    hrLogin
}
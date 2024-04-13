const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = process.env.SALT_ROUNDS;

const tpoLogin = asyncHandler(async(req,res)=>{
    // console.log(req.body);
    const {emailorg,password} = req.body;
    if(!emailorg || !password){
        return res.status(400).json({message:"all fields required"});
    }

    const [foundtpo] = await db.query('select tpo_id, password, emailorg, role from tpoaccounts where emailorg = ?',[emailorg])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    if(!foundtpo[0]){
        return res.status(401).json({message:"tpo not found"});
    }
    const match = await bcrypt.compare(password,foundtpo[0].password);
    if(match){
        const [logindate] = await db.query(`select curdate() as logindate`);
        const accessToken = jwt.sign(
            {"username": foundtpo[0].emailorg},
            process.env.SECRET_ACCESS_TOKEN,
            {expiresIn: '1d'}
        );

        const refreshToken =  jwt.sign(
            {"username": foundtpo[0].emailorg},
            process.env.SECRET_REFRESH_TOKEN,
            {expiresIn: '2d'}
        );
        const addrefreshtoken = await db.query(`update tpoaccounts set ? where tpo_id = ?`,[{lastlogin:logindate[0].logindate,"refreshToken":refreshToken},foundtpo[0].tpo_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"success",accessToken,"userid":foundtpo[0].tpo_id,"role":foundtpo[0].role});
    }
    
    return res.status(401).json({message:"wrongpwd"});
});

const tpoRegister = asyncHandler(async(req,res)=>{
    const tpobody = req.body;
    console.log(req.body);
    if(!tpobody || Object.keys(tpobody).length<7){
        return res.status(401).json({message:"all fields required"});
    }
    const [duplicate0] = await db.query(`select * from tpoaccounts where emailorg = ?`,[tpobody.emailorg]);
    const [duplicate1] = await db.query(`select * from tpoaccounts where phonenumber = ?`,[tpobody.phonenumber]);

    // console.log(duplicate[0]);
    if(duplicate0[0]){
        return res.status(400).json({message:"emailorgerror"});
    }
    if(duplicate1[0]){
        return res.status(400).json({message:"numbererror"});
    }
    

    const hashpassword = await bcrypt.hash(tpobody.password,parseInt(saltRounds));
    tpobody["password"] = hashpassword;
    const sqlregister = `insert into tpoaccounts set ?`;
    const [register] = await db.query(sqlregister,tpobody)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"tpo created","userid":register.insertId});
});

module.exports = {
    tpoLogin,
    tpoRegister
}
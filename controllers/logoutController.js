const expressAsyncHandler = require("express-async-handler");
const db = require('../database/database');

const handleLogout = expressAsyncHandler(async (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt)
        return res.sendStatus(204);
    let refreshToken = cookies.jwt;
    const [user] = await db.query(`select user_id from useraccounts where refreshToken = ?`,[refreshToken])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    const [admin] = await db.query(`select admin_id from adminaccounts where refreshToken = ?`,[refreshToken])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    // console.log(user[0]);
    // console.log(admin[0]);
    // refreshToken = "deleted";
    if(user[0]){
        const delrefresh = await db.query(`update useraccounts set ? where user_id = ?`,[{"refreshToken":""},user[0].user_id])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    })
        // res.clearCookie('jwt', {httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"user loggedout"});
    }

    if(admin[0]){
        const delrefresh = await db.query(`update adminaccounts set ? where admin_id = ?`,[{"refreshToken":""},admin[0].admin_id])
                                    .then(res=>{
                                        console.log("admin refresh cleared");
                                    })
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    })
        // res.clearCookie('jwt', {httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"admin loggedout"});
    }

    res.clearCookie('jwt', {httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
    return res.status(200).json({message:"no refresh token found"});
});

module.exports = {
    handleLogout
};
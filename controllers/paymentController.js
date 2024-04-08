const { response } = require('express');
const db = require('../database/database');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const createOrder = asyncHandler(async(req,res)=>{
    const {username,amount} = req.body;
    const [user] = await db.query(`select user_id from useraccounts where username = ?`,[username])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    const user_id = user[0].user_id;
    console.log(user_id);
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET })

    instance.orders.create({
    amount: amount,
    currency: "INR",
    receipt: `receipt#`+user_id
    })
    .then(response=>{
        return res.status(200).json(response);
    })
    .catch(err=>{
        return res.status(400).json(err);
    });
});

const validatePayment = asyncHandler(async(req,res)=>{
    const razorpaydetails = req.body;
    // console.log(razorpaydetails);
    if(!razorpaydetails || !Object.keys(razorpaydetails).length){
        return res.status(400).json({message:"empty data provided"});
    }

    const sha = crypto.createHmac("sha256",process.env.RAZORPAY_SECRET);
    sha.update(`${razorpaydetails.order_id}|${razorpaydetails.payment_id}`);
    const digest = sha.digest("hex");
    if(digest!== razorpaydetails.signature){
        return res.status(400).json({message:"transactiopn is not legit"})
    }
    const [startdate] = await db.query(`select curdate() as startdate`);
    const [enddate] = await db.query(`select date_add(curdate(),interval 1 year) as enddate`);
    const [user] = await db.query(`select user_id from useraccounts where username = ?`,[razorpaydetails.username])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    const user_id = user[0].user_id;
    // console.log(startdate[0].startdate)
    // console.log(enddate[0].enddate)
    const subobj = {
        "user_id": user_id,
        "plan": "yearly",
        "startdate":startdate[0].startdate,
        "enddate":enddate[0].enddate,
        "amount":razorpaydetails.amount,
        "status":"active",
        "payment_id":razorpaydetails.payment_id,
        "order_id":razorpaydetails.order_id,
        "razorpaysignature":razorpaydetails.signature
    }
    const subs = await db.query(`insert into subscriptions set ?`,subobj)
                          .catch(err=>{
                            return res.status(400).json({message: err.sqlMessage});
                          });

    return res.status(200).json({message:"success"});   
});

module.exports = {
    createOrder,
    validatePayment,
}
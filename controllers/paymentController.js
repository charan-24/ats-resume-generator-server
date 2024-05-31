const { response } = require('express');
const db = require('../database/database');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const axios = require('axios');
const SERVER = process.env.SERVER;

const createOrder = asyncHandler(async(req,res)=>{
    const {username,amount} = req.body;
    console.log(req.body);
    const [user] = await db.query(`select user_id,firstname,lastname,email, phonenumber from userdetails where username = ?`,[username])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    const user_id = user[0].user_id;
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY, key_secret: process.env.RAZORPAY_SECRET })

    instance.orders.create({
    amount: amount*100,
    currency: "INR",
    receipt: `receipt#`+user_id,
    notes:{
        "key":process.env.RAZORPAY_KEY,
        "userid":user[0].user_id,
        "fullname": user[0].firstname +" "+ user[0].lastname,
        "email": user[0].email,
        "mobile": user[0].phone_number
    }
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
    let fullname = razorpaydetails.fullname;
    let email = razorpaydetails.email;
    let type = razorpaydetails.type;
    if(razorpaydetails.eventId){
        let eventId = razorpaydetails.eventId;
    }
    console.log(type);
    console.log(razorpaydetails);
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
    const user_id = razorpaydetails.user_id;
    const subobj = {
        "user_id": user_id,
        "plan": "yearly",
        "startdate":startdate[0].startdate,
        "enddate":enddate[0].enddate,
        "amount":razorpaydetails.amount,
        "status":"active",
        "payment_id":razorpaydetails.payment_id,
        "order_id":razorpaydetails.order_id,
        "razorpaysignature":razorpaydetails.signature,
        "resumesplan":10,
        "resumesused":0
    }
    console.log("subobj:"+subobj);
    if(type == 'annual'){
        const subs = await db.query(`insert into subscriptions set ?`,subobj)
                            .catch(err=>{
                                return res.status(400).json({message: err.sqlMessage});
                            });
        const paid = await db.query('update useraccounts set ? where user_id = ?',[{subscribed:true,resumesplan:10},user_id]);
        let startDate = subobj.startdate + '';
        startDate = startDate.slice(4, 15);
        let endDate = subobj.enddate+'';
        endDate = endDate.slice(4, 15);
        let postData = {
            "name":fullname,
            "email":email,
            "paymentAmount": subobj.amount,
            "subscriptionPlan":"Annual",
            "startDate":startDate,
            "expiryDate":endDate,
            "dashboard":"https://education.jacinthpaul.com/app/overview.php",
            "support":"education@jacinthpaul.com"
        }

        axios.post(`${SERVER}/portal/sendPaymentConfirmMail`,postData)
                        .then(res=>{
                            console.log(res.data);
                        })
                        .catch(err=>{
                            console.log(err);
                        });

        axios.post(`${SERVER}/portal/sendWelcomeMail`,{"name":fullname,"email":email})
                        .then(res=>{
                            console.log(res.data);
                        })
                        .catch(err=>{
                            console.log(err);
                        });
    }
    else if (type == 'hackathon' || type == 'contest'){
        await db.query(`update eventsapplied set ? where user_id = ? and event_id = ? and type = ?`,[{payment:1},user_id,eventId,type])
                .catch(err=>{
                    return res.status(500).json({message: err.sqlMessage})
                });
    }
    else if(type == 'meetup'){
        await db.query(`update meetupsapplied set ? where user_id = ? and event_id = ? and type = ?`,[{payment:1},user_id,eventId,type])
                .catch(err=>{
                    return res.status(500).json({message: err.sqlMessage})
                });
    }
    else if(type == 'training'){
        await db.query(`insert into trainingsapplied set ?`,[{user_id:user_id,training_id:eventId,payment:1}])
                .catch(err=>{
                    return res.status(500).json({message: err.sqlMessage})
                });
    }

    return res.status(200).json({message:"success"});   
});

const createCoupon = asyncHandler(async(req,res)=>{
    const coupon = req.body;
    if(!coupon || Object.keys(coupon).length==0){
        return res.status(400).json({message:"empty coupon"});
    }
    const [duplicate] = await db.query(`select couponcode from coupons where couponcode = ?`,[coupon.couponcode])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    console.log(duplicate[0]);
    if(duplicate[0]){
        return res.status(400).json({message:"duplicate coupon code entered"});
    }
    const addcouponn = await db.query(`insert into coupons set ?`,[coupon])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json({message:"coupon created"});
});

const getCoupons = asyncHandler(async(req,res)=>{
    const [getCoupons] = await db.query(`select * from coupons`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage})
                                });
    return res.status(200).json(getCoupons);
})

module.exports = {
    createOrder,
    validatePayment,
    createCoupon,
    getCoupons
}
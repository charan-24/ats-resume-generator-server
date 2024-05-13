const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const axios = require('axios');
const SERVER = process.env.SERVER;

const submitFeedback = asyncHandler(async(req,res)=>{
    const {user_id,fullname,email,category,subject,description,urgency,contact_method} = req.body;
    console.log(req.body);
    const feedbackobj = {
        "user_id":user_id,
        "fullname":fullname,
        "email":email,
        "category":category,
        "subject":subject,
        "description":description,
        "urgency":urgency,
        "contact_method":contact_method,
    };

    const sql = `insert into feedbacks set ?`;
    const feedback = await db.query(sql,feedbackobj)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage})
                                });
    await axios.post(`${SERVER}/portal/sendFeedbackMail`,{"name":feedbackobj.fullname,"email":feedbackobj.email})
                .then(res=>{
                    console.log(res.data);
                })
                .catch(err=>{
                    console.log(err);
                });

    return res.status(200).json({message:"feedback submitted"});
});

const displayFeedbacks = asyncHandler(async(req,res)=>{
    const feedbacksql = `select * from feedbacks order by issue_date`;
    const feedbacks = await db.query(feedbacksql)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                })
    return res.status(200).json(feedbacks[0]);
});

const changeStatus = asyncHandler(async(req,res)=>{
    const {feedback_id,status}  = req.body;
    console.log(feedback_id,status);
    if(!feedback_id || !status){
        return res.status(400).json("empty data");
    }

    const changestatus = await db.query(`update feedbacks set ? where feedback_id = ?`,[{status},feedback_id])
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    return res.status(200).json("status changed");
})

module.exports = {
    submitFeedback,
    displayFeedbacks,
    changeStatus
}
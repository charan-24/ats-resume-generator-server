const asyncHandler = require('express-async-handler');
const db = require('../database/database');

const submitFeedback = asyncHandler(async(req,res)=>{
    const {user_id,username,fullname,email,category,subject,description,urgency,contact_method} = req.body;
    const feedbackobj = {
        "user_id":user_id,
        "username":username,
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

module.exports = {
    submitFeedback,
    displayFeedbacks
}
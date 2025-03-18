const asyncHandler = require('express-async-handler');
const db = require('../database/database');

const removeJobAlertUsers = asyncHandler(async(req,res)=>{
    await db.query(`delete from jobalertusers where added_date < NOW()`)
            .catch(err=>{
                return res.status(400).json(err.sqlMessage);
            });
    return res.status(200).json("removeJobAlertUsers done")
});

module.exports = {
    removeJobAlertUsers
}
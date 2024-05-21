const asyncHandler = require('express-async-handler');
const db = require('../database/database');

const getTrainings = asyncHandler(async(req,res)=>{
    const [trainings] = await db.query(`select * from trainings`)
                                .catch(err=>{
                                    return res.status(500).json(err.sqlMessage);
                                });
    return res.status(200).json(trainings);
});

const getCourses = asyncHandler(async(req,res)=>{
    const [courses] = await db.query(`select * from courses`)
                                .catch(err=>{
                                    return res.status(500).json(err.sqlMessage);
                                });
    return res.status(200).json(courses);
});

module.exports = {
    getTrainings,
    getCourses
}
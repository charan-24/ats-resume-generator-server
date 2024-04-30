const asyncHandler = require('express-async-handler');
const db = require('../database/database');

const getUpComingHackathons = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from hackathons where startdate > curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getRecentHackathons = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from hackathons where enddate < curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getUpComingContests = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from codingcontests where startdate > curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getRecentContests = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from codingcontests where enddate < curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getUpComingMeetups = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from codingmeetups where startdate > curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getRecentMeetups = asyncHandler(async(req,res)=>{
    const [upcoming] = await db.query(`select * from codingmeetups where enddate < curdate()`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(upcoming);
});

const getHackathonWinners = asyncHandler(async(req,res)=>{
    const [winners] = await db.query(`select * from hackathonwinners order by created_date desc`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(winners);
});

const getContestWinners = asyncHandler(async(req,res)=>{
    const [winners] = await db.query(`select * from contestwinners order by created_date desc`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(winners);
});

const getMeetupWinners = asyncHandler(async(req,res)=>{
    const [winners] = await db.query(`select * from meetupwinners order by created_date desc`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    return res.status(200).json(winners);
});

const getEventStats = asyncHandler(async(req,res)=>{
    const [stats] = await db.query(`select * from eventstats`)
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    console.log(stats);
    return  res.status(400).json(stats[0]);
})

module.exports = {
    getUpComingHackathons,
    getRecentHackathons,
    getUpComingContests,
    getRecentContests,
    getUpComingMeetups,
    getRecentMeetups,
    getHackathonWinners,
    getContestWinners,
    getMeetupWinners,
    getEventStats
}


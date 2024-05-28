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
    // console.log(stats);
    return  res.status(400).json(stats[0]);
});

const editEvent = asyncHandler(async(req,res)=>{
    let {eventId,event} = req.body;
    event = JSON.parse(event);
    console.log(eventId,event);
    if(!eventId || !event || !Object.keys(event)){
        return res.status(400).json("no data");
    };
    try{
        if(event.type=="hackathon"){
            await db.query(`update hackathons set ? where hackathon_id = ?`,[event,eventId])
        }
        else if(event.type=="contest"){
            await db.query(`update codingcontests set ? where contest_id = ?`,[event,eventId])
        }
        else if(event.type=="meet-up"){
            await db.query(`update codingmeetups set ? where meetup_id = ?`,[event,eventId])
        }
        return res.status(200).json(`${event.type} edited`)
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const deleteEvent = asyncHandler(async(req,res)=>{
    const {eventId, type} = req.params;
    console.log(req.params);
    if(!eventId || !type){
        return res.status(400).json("no data");
    }

    try{
        if(type=="hackathon"){
            await db.query(`delete from hackathons where hackathon_id = ?`,[eventId]);
        }
        else if(type=="contest"){
            await db.query(`delete from codingcontests where contest_id = ?`,[eventId])
        }
        else if(type=="meet-up"){
            await db.query(`delete from codingmeetups where meetup_id = ?`,[eventId])
        }
        return res.status(200).json(`${type} deleted`) 
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const getEventsRegisteredUsers = asyncHandler(async(req,res)=>{
    const registered = {};
    const [hackathons] = await db.query(`select ea.*, e.title, e.registrationfee, u.username, u.firstname, u.lastname from eventsapplied ea
                                        join hackathons e on ea.event_id = e.hackathon_id
                                        join userdetails u on ea.user_id = u.user_id
                                        where ea.type = ?`,['hackathon'])
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    registered["hackathons"] = hackathons;

    const [contests] = await db.query(`select ea.*, e.title, e.registrationfee, u.username, u.firstname, u.lastname from eventsapplied ea
                                        join codingcontests e on ea.event_id = e.contest_id
                                        join userdetails u on ea.user_id = u.user_id
                                        where ea.type = ?`,['contest'])
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    registered["contests"] = contests;

    const [meetups] = await db.query(`select ea.*, e.title, e.registrationfee, u.username, u.firstname, u.lastname from meetupsapplied ea
                                        join codingmeetups e on ea.event_id = e.meetup_id
                                        join userdetails u on ea.user_id = u.user_id`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    registered["meetups"] = meetups;

    return res.status(200).json(registered);
});

const makeWinner = asyncHandler(async(req,res)=>{
    const winnerBody = req.body;
    console.log(winnerBody);
    if(winnerBody.eventType == 'meetup'){
        await db.query(`update meetupsapplied set ? where user_id = ? and event_id = ?`,[{isWinner:1},winnerBody.userId,winnerBody.eventId])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                })
    }
    else {
        await db.query(`update eventsapplied set ? where type = ? and user_id = ? and event_id = ?`,[{isWinner:1},winnerBody.eventType,winnerBody.userId,winnerBody.eventId])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                })
    }
    return res.status(200).json(`winner for ${winnerBody.eventType} updated`);
});
const revokeWinner = asyncHandler(async(req,res)=>{
    const winnerBody = req.body;
    console.log(winnerBody);
    if(winnerBody.eventType == 'meetup'){
        await db.query(`update meetupsapplied set ? where user_id = ? and event_id = ?`,[{isWinner:0},winnerBody.userId,winnerBody.eventId])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                })
    }
    else {
        await db.query(`update eventsapplied set ? where type = ? and user_id = ? and event_id = ?`,[{isWinner:0},winnerBody.eventType,winnerBody.userId,winnerBody.eventId])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                })
    }
    return res.status(200).json(`winner for ${winnerBody.eventType} revoked`);
});

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
    getEventStats,
    editEvent,
    deleteEvent,
    getEventsRegisteredUsers,
    makeWinner,
    revokeWinner
}


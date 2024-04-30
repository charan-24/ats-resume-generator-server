const bcrypt = require('bcrypt');
const db = require('../database/database');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

//get admin overview details
const getAdminOverview = asyncHandler(async(req,res)=>{

    const adminoverview = {};

    const [users] = await db.query(`select * from useraccounts inner join userdetails on userdetails.user_id = useraccounts.user_id`)
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    adminoverview["users"] = users;  

    const [admins] = await db.query(`select * from adminaccounts`)
                             .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                             });
    adminoverview["admins"] = admins;        

    const [hrs] = await db.query(`select * from hraccounts`)
                             .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                             });
    adminoverview["hrs"] = hrs;

    const [tpos] = await db.query(`select * from tpoaccounts`)
                             .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                             });
    adminoverview["tpos"] = tpos;

    const [jobslisted] = await db.query(`select * from jobslisted`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage)
                                    });
    adminoverview["jobslisted"] = jobslisted;

    const [feedbacks] = await db.query(`select * from feedbacks order by issue_date desc`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage)
                                    });
    adminoverview["feedbacks"] = feedbacks;

    const [hackathons] = await db.query(`select * from hackathons`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage)
                                    }); 
    adminoverview["hackathons"] = hackathons;

    const [contests] = await db.query(`select * from codingcontests`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage)
                                    }); 
    adminoverview["contests"] = contests;

    const [meetups] = await db.query(`select * from codingmeetups`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });
    adminoverview["meetups"] = meetups;       

    const [hackathonwinners] = await db.query(`select * from hackathonwinners`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                }); 
    adminoverview["hackathonwinners"] = hackathonwinners;  
                     
    const [contestwinners] = await db.query(`select * from contestwinners`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });
    adminoverview["contestwinners"] = contestwinners;

    const [meetupwinners] = await db.query(`select * from meetupwinners`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });  
    adminoverview["meetupwinners"] = meetupwinners;

    const [stats] = await db.query(`select * from eventstats`)
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    adminoverview["eventstats"] = stats[0];

    const [resumereqs] = await db.query(`select count(*) as resumereqs from userresumes`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    adminoverview["resumereqs"] = resumereqs[0];

    return res.status(200).json(adminoverview);
});

//getting userdetails from database
const getUsers = asyncHandler(async (req, res) => {
    const sql = `select * from userDetails`;
    const result = await db.query(sql)
                            .catch(err => {
                                // console.log(err);
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).send(result[0]);
});

const addjobroles = asyncHandler(async(req,res)=>{
    const jobroles = req.body;
    if(jobroles.length==0){
        return res.status(204).json({"error":"no data"});
    }
    for(let i=0;i<jobroles.length;i++){
        const jobrole = jobroles[i];
        const addrole = await db.query(`insert into jobroles set ?`,[jobrole])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    }
    return res.status(200).json({message:"jobroles added"});
});



const getAllJobs = asyncHandler(async(req,res)=>{
    const sql = `select * from jobslisted;`;
    const result = await db.query(sql)
                        .catch(err=>{
                            return res.status(401).json({message:err.sqlMessage});
                        });
    return res.status(200).json(result[0]);
});

const addAJob = asyncHandler(async(req,res)=>{
    const {jobrole_id, jobtitle, location, company, jobtype, experience, description} = req.body;

    if(!jobrole_id || !jobtitle || !location || !company || !jobtype || !experience || !description){
        return res.status(401).json({message:"all fields required"});
    }
    const jobobj = {
        "jobrole_id":jobrole_id,
        "title":jobtitle,
        "company":company,
        "description":description,
        "location":location,
        "job_type":jobtype,
        "experience":experience,
    };

    const jobaddsql = `insert into jobslisted set ?`;
    const jobadded = await db.query(jobaddsql,jobobj)
                                .catch(err=>{
                                    console.log(err);
                                    return res.status(400).json({message:err.sqlMessage});
                                });                            
    return res.status(200).json({message:"new job added"});
});

const addBulkJobs = asyncHandler(async(req,res)=>{
    const bulkjobs = req.body;
    console.log(bulkjobs);
    // if(!bulkjobs || bulkjobs.length===0){
    //     return res.status(401).json({message:"jobs provided are empty"});
    // }

    // for(let i=0;i<bulkjobs.length;i++){
    //     const job = bulkjobs[i];
    //     const jobobj = {
    //         "jobrole_id":job.jobrole_id,
    //         "title":job.title,
    //         "company":job.company,
    //         "description":job.description,
    //         "location":job.location,
    //         "job_type":job.type,
    //         "experience":job.experience,
    //     };
    //     if(job.salary){
    //         jobobj["salary"]=job.salary;
    //     }
    //     const jobaddsql = `insert into jobslisted set ?`;
    //     const jobadded = await db.query(jobaddsql,jobobj)
    //                                 .catch(err=>{
    //                                     console.log(err);
    //                                     return res.status(400).json({message:err.sqlMessage});
    //                                 });
    // }
    return res.status(200).json({message:bulkjobs.length + ` new jobs are added`});
});

const editJob = asyncHandler(async(req,res)=>{
    const {job_id,changedjob} = req.body;
    if(!job_id || !changedjob || !Object.keys(changedjob).length){
        return res.status(400).json({message:"empty data provided"});
    }

    const editjob = await db.query(`update jobslisted set ? where job_id = ?`,[changedjob,job_id])
                            .catch(err=>{
                                return res.status(401).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"job edited"});
});

const deleteJob = asyncHandler (async (req,res)=>{
    const {job_id, job_title} = req.body;
    if(!job_id || !job_title){
        return res.status(401).json({message:"all fields required"});
    }

    const sql = `delete from jobslisted where job_id = ? and title = ?;`;
    const result = await db.query(sql,[job_id,job_title])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"job deleted"});
});

//delete a user
const deleteUser = asyncHandler(async(req,res)=>{
    const {user_id} = req.body;
    if(!user_id){
        return res.status(401).json({message:"user_id required"});
    }
    const [foundUser] = await db.query(`select user_id from useraccounts where user_id = ?`,[user_id]);
    if(!foundUser[0]){
        return res.status(201).json({message:"no user found"});
    }

    const work = await db.query(`delete from workexperience where user_id = ?`,[user_id])
                            .then(res=>{
                                console.log("workexperience deleted");
                            })
                            .catch(err=>{
                                return res.status(201).json({message:err.sqlMessage});
                            })
    const usercertificates = await db.query(`delete from usercertificates where user_id = ?`,[user_id])
                                        .then(res=>{
                                            console.log("certificates deleted");                                
                                        })
                                        .catch(err=>{
                                            return res.status(201).json({message:err.sqlMessage});
                                        });
    const userprojects = await db.query(`delete from userprojects where user_id = ?`,[user_id])
                                        .then(res=>{
                                            console.log("userprojects deleted");                                
                                        })
                                        .catch(err=>{
                                            return res.status(201).json({message:err.sqlMessage});
                                        });
    const feedbacks = await db.query(`delete from feedbacks where user_id = ?`,[user_id])
                                        .then(res=>{
                                            console.log("feedbacks deleted");                                
                                        })
                                        .catch(err=>{
                                            return res.status(201).json({message:err.sqlMessage});
                                        });
    const education = await db.query(`delete from educationaldetails where user_id = ?`,[user_id])
                                .then(res=>{
                                    console.log("educational details deleted");                                
                                })
                                .catch(err=>{
                                    return res.status(201).json({message:err.sqlMessage});
                                });
    const userdetail = await db.query(`delete from userdetails where user_id = ?`,[user_id])
                                .then(res=>{
                                    console.log("user details deleted");                                
                                })
                                .catch(err=>{
                                    return res.status(201).json({message:err.sqlMessage});
                                });
    const useraccount = await db.query(`delete from useraccounts where user_id = ?`,[user_id])
                                .then(res=>{
                                    console.log("useraccount deleted");
                                })
                                .catch(err=>{
                                    return res.status(201).json({message:err.sqlMessage});
                                });
    return res.status(200).json({message:"user deleted"});
});

const addHackathon = asyncHandler(async(req,res)=>{
    const hackathon = req.body;
    // console.log(hackathon);
    if(!hackathon || !Object.keys(hackathon).length){
        return res.status(401).json({message:"empty hackathon data"});
    }
    
    const addhack = await db.query(`insert into hackathons set ?`,hackathon)
                                .catch(err=>{
                                    return res.status(200).json({message:err.sqlMessage});
                                });

    return res.status(200).json({message:"hackathon added"});
});

const addContest = asyncHandler(async(req,res)=>{
    const contest = req.body;
    if(!contest || !Object.keys(contest).length){
        return res.status(401).json({message:"empty contest data"});
    }
    
    const addcontest = await db.query(`insert into codingcontests set ?`,contest)
                                .catch(err=>{
                                    return res.status(200).json({message:err.sqlMessage});
                                });

    return res.status(200).json({message:"contest added"});
});
const addMeetup = asyncHandler(async(req,res)=>{
    const meetup = req.body;
    if(!meetup || !Object.keys(meetup).length){
        return res.status(401).json({message:"empty meetup data"});
    }
    
    const addcontest = await db.query(`insert into codingmeetups set ?`,meetup)
                                .catch(err=>{
                                    return res.status(200).json({message:err.sqlMessage});
                                });

    return res.status(200).json({message:"meetup added"});
});

const addHackathonWinner = asyncHandler(async(req,res)=>{
    const winner = req.body;
    const addwinner = await db.query(`insert into hackathonwinners set ?`,winner)
                                .catch(err=>{
                                    return res.status(401).json({message:err.sqlMessage});
                                });
    return res.status(200).json({message:"hackathon winners added"});
});

const addContestWinner = asyncHandler(async(req,res)=>{
    const winner = req.body;

    const addwinner = await db.query(`insert into contestwinners set ?`,winner)
                                .catch(err=>{
                                    return res.status(401).json({message:err.sqlMessage});
                                });
    return res.status(200).json({message:"contest winners added"});
});

const addMeetupWinner = asyncHandler(async(req,res)=>{
    const winner = req.body;

    const addwinner = await db.query(`insert into meetupwinners set ?`,winner)
                                .catch(err=>{
                                    return res.status(401).json({message:err.sqlMessage});
                                });
    return res.status(200).json({message:"meetup winners added"});
});

const adminRegister = asyncHandler (async(req,res)=>{
    const {username, password, firstname, lastname, email} = req.body;
    if(!username || !password || !email || !firstname || !lastname){
        return res.status(401).json({message:"all fields required"});
    }
    const [duplicate] = await db.query(`select * from adminaccounts where username = ? || email = ?`,[username,email]);
    // console.log(duplicate[0]);
    if(duplicate[0]){
        return res.status(400).json({message:"duplicate admin entry found"});
    }

    const hashpassword = await bcrypt.hash(password,11);
    const adminobj = { 
        "username":username,
        "password":hashpassword,
        "firstname": firstname,
        "lastname": lastname,
        "email":email
    };
    const sqllogin = `insert into adminaccounts set ?`;
    const login = await db.query(sqllogin,adminobj)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"admin created"});
});

const adminLogin = asyncHandler(async(req,res)=>{
    const {username, password} = req.body;
    if(!username){
        return res.status(400).json({message:"username required"})
    }
    if(!password){
        return res.status(400).json({message:"password required"})        
    }
    const [foundAdmin] = await db.query(`select admin_id, password, username, role from adminaccounts where username = ? || email = ?`,[username,username]);
    console.log(foundAdmin[0]);
    if(!foundAdmin[0]){
        return res.status(401).json({message:"admin not found"});
    }
    const match = await bcrypt.compare(password,foundAdmin[0].password);
    if(match){
        const [logindate] = await db.query(`select curdate() as logindate`);
        const accessToken = jwt.sign(
            {"username": foundAdmin[0].username},
            process.env.SECRET_ACCESS_TOKEN,
            {expiresIn: '1d'}
        );
        const refreshToken =  jwt.sign(
            {"username": foundAdmin[0].username},
            process.env.SECRET_REFRESH_TOKEN,
            {expiresIn: '2d'}
        );
        const addrefreshtoken = await db.query(`update adminaccounts set ? where admin_id = ?`,[{last_login:logindate[0].logindate,"refreshToken":refreshToken},foundAdmin[0].admin_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"success",accessToken,"userid":foundAdmin[0].admin_id,"role":foundAdmin[0].role});    
    }
    return res.status(400).json({message:"wrongpwd"});
});

const addColleges = asyncHandler(async(req,res)=>{
    const colleges = req.body;
    if(colleges.length === 0){
        return res.status(204).json({message:"no colleges data"});
    }
    for(let i=0;i<colleges.length;i++){
        const college = colleges[i];
        const addclg = await db.query(`insert into colleges set ?`,[college])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    }
    return res.status(200).json("colleges added");
});

const getColleges = asyncHandler(async(req,res)=>{
    const [colleges] = await db.query(`select * from colleges`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });
    return res.status(200).json(colleges);
});

const updateStats = asyncHandler(async(req,res)=>{
    const stats = req.body;
    if(!stats || Object.keys(stats).length==0){
        return res.status(400).json({message:"no data"});
    }

    const updatestat = await db.query(`update eventstats set ? where stat_id = 1`,[stats])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });
    return res.status(200).json({message:"stats updated"});
});



module.exports = {
    getAdminOverview,
    getUsers,
    addjobroles,
    getAllJobs,
    addAJob,
    addBulkJobs,
    editJob,
    deleteJob,
    deleteUser,
    addHackathon,
    addContest,
    addMeetup,
    addHackathonWinner,
    addContestWinner,
    addMeetupWinner,
    adminRegister,
    adminLogin,
    addColleges,
    getColleges,
    updateStats
}
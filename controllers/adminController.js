const bcrypt = require('bcrypt');
const db = require('../database/database');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


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
    const {jobrole_name} = req.body;
    if(!jobrole_name){
        return res.status(400).json({message:"job role required"});
    }
    const [duplicate] = await db.query(`select * from jobroles where jobrole_name = ?`,[jobrole_name]);
    if(duplicate[0]){
        return res.status(400).json({message:"job role dupliacte found"});
    }
    const addrole = await db.query(`insert into jobroles set ?`,{"jobrole_name":jobrole_name})
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json({message:"jobrole added"});
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
    const {jobrole_id, jobtitle, location, company, type, experience, description} = req.body;

    if(!jobrole_id || !jobtitle || !location || !company || !type || !experience || !description){
        return res.status(401).json({message:"all fields required"});
    }
    const jobobj = {
        "jobrole_id":jobrole_id,
        "title":jobtitle,
        "company":company,
        "description":description,
        "location":location,
        "job_type":type,
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
    const {bulkjobs} = req.body;
    if(!bulkjobs || bulkjobs.length===0){
        return res.status(401).json({message:"jobs provided are empty"});
    }

    for(let i=0;i<bulkjobs.length;i++){
        const job = bulkjobs[i];
        const jobobj = {
            "jobrole_id":job.jobrole_id,
            "title":job.title,
            "company":job.company,
            "description":job.description,
            "location":job.location,
            "job_type":job.type,
            "experience":job.experience,
        };
        if(job.salary){
            jobobj["salary"]=job.salary;
        }
        const jobaddsql = `insert into jobslisted set ?`;
        const jobadded = await db.query(jobaddsql,jobobj)
                                    .catch(err=>{
                                        console.log(err);
                                        return res.status(400).json({message:err.sqlMessage});
                                    });
    }
    return res.status(200).json({message:bulkjobs.length + ` new job are added`});
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
    const {username, password,email} = req.body;
    if(!username || !password || !email){
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
    const [foundUser] = await db.query(`select admin_id, password, username, role from adminaccounts where username = ? || email = ?`,[username,username]);
    // console.log(hashpassword[0]);
    if(!foundUser[0] || !foundUser[0].length){
        return res.status(401).json({message:"admin not found"});
    }
    const match = await bcrypt.compare(password,foundUser[0].password);
    if(match){
        const [logindate] = await db.query(`select curdate() as logindate`);
        const accessToken = jwt.sign(
            {"username": foundUser[0].username},
            process.env.SECRET_ACCESS_TOKEN,
            {expiresIn: '1d'}
        );
        const refreshToken =  jwt.sign(
            {"username": foundUser[0].username},
            process.env.SECRET_REFRESH_TOKEN,
            {expiresIn: '2d'}
        );
        const addrefreshtoken = await db.query(`update adminaccounts set ? where admin_id = ?`,[{last_login:logindate[0].logindate,"refreshToken":refreshToken},foundUser[0].admin_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({accessToken});    
    }
    return res.status(400).json({message:"unauthorized"});
});



module.exports = {
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
    adminLogin
}
const bcrypt = require('bcrypt');
const db = require('../database/database');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
// const XLSX = require('xlsx');
const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
  } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const SERVER = process.env.SERVER;
const CLIENT = process.env.CLIENT;
const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET;

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

    const [resumereqs] = await db.query(`select created_date from userresumes`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    adminoverview["resumereqs"] = resumereqs;

    const [jobsapplied] = await db.query(`select ja.*, ue.college_id from jobsapplied ja join educationaldetails ue on ja.user_id = ue.user_id`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    })
    adminoverview["jobsapplied"] = jobsapplied;

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

const getUsersOfACollege = asyncHandler(async(req,res)=>{
    const {college_id} = req.params;
    // console.log(college_id);
    if(!college_id){
        return res.status(400).json({message:"no collegeid"});
    }
    if(college_id == -1){
        const [users] = await db.query(`select count(user_id) as users from useraccounts`)
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
        // console.log(users[0].users);
        return res.status(200).json(users[0].users);
    }
    const [users] = await db.query(`select count(college_id) as users from educationaldetails where college_id = ?`,[college_id])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    // console.log(users[0].users);
    return res.status(200).json(users[0].users);
})
const getApplFromACollege = asyncHandler(async(req,res)=>{
    const {college_id} = req.params;
    // console.log(college_id);
    if(!college_id){
        return res.status(400).json({message:"no collegeid"});
    }
    const [applications] = await db.query(`select count(ja.applied_id) as applications from jobsapplied ja join educationaldetails ue on ja.user_id = ue.user_id where college_id = ?`,[college_id])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    // console.log(users[0].users);
    return res.status(200).json(applications[0].applications);
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
    const {jobrole_id, jobtitle, location, company, jobtype, experience, description,joburl} = req.body;
    console.log(req.body);
    if(!jobrole_id || !jobtitle || !location || !company || !jobtype || !experience || !description || joburl){
        return res.status(401).json({message:"all fields required"});
    }
    const jobobj = {
        "jobrole_id":jobrole_id,
        "title":jobtitle,
        "company":company,
        "description":description,
        "location":location,
        "jobtype":jobtype,
        "experience":experience,
        "joburl":joburl,
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
    let bulkjobs = req.body;
    const buffer = req?.file?.buffer;
    // console.log(buffer);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    bulkjobs = XLSX.utils.sheet_to_json(sheet);
    // console.log(bulkjobs);
    // return res.status(200).json("file received");
    let newjobs = new Set();
    if(!bulkjobs || bulkjobs.length===0){
        return res.status(401).json({message:"jobs provided are empty"});
    }
    const [jobroles] = await db.query(`select jobrole_id, jobrole_name from jobroles`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    const jobrolesMap = {};
    for(let i=0;i<jobroles.length;i++){
        const tempJob = jobroles[i];
        jobrolesMap[tempJob.jobrole_name] = tempJob.jobrole_id;
    }
    for(let i=0;i<bulkjobs.length;i++){
        const job = bulkjobs[i];
        const jobobj = {
            "jobrole_id":jobrolesMap[job.jobrole] ?? 59,
            "title":job.title,
            "company":job.company,
            "description":job.description,
            "location":job.location,
            "jobtype":job.jobtype,
            "experience":job.experience,
            "joburl":job.joburl
        };
        newjobs.add(jobobj.jobrole_id);
        if(job.salary){
            jobobj["salary"]=job.salary;
        }
        // const jobaddsql = `insert into jobslisted set ?`;
        // const jobadded = await db.query(jobaddsql,jobobj)
        //                             .catch(err=>{
        //                                 console.log(err);
        //                                 return res.status(400).json({message:err.sqlMessage});
        //                             });
    }
    console.log(bulkjobs.length + ` new jobs are added`); 

    //storing users for whom we have to send job alert mails 
    let allusers=[];
    for(let item of newjobs){
        const jobrole = item;
        const [users] = await db.query(`select user_id from preferredjobroles where jobrole_id = ?`,[jobrole])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
        // console.log(users);
        allusers.push(...users)
    }
    console.log(allusers);

    const finalUsers = [];
    const unqusers = new Set();
    for(let i=0;i<allusers.length;i++){
        if(!unqusers.has(allusers[i].user_id)){
            unqusers.add(allusers[i].user_id);
            finalUsers.push({user_id:allusers[i].user_id})
        }
    }
    console.log(finalUsers);
    console.log(unqusers);

    for(let i=0;i<finalUsers.length;i++){
        const tempobj = finalUsers[i];
        await db.query(`insert into jobalertusers set ?`,[tempobj])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                });
    }
    
    // await axios.post(`${SERVER}/admin/dataForJobAlert`,allusers)
    //             .then(res=>{
    //                 console.log(res.data);
    //             })
    //             .catch(err=>{
    //                 console.log(err);
    //             });
    return res.status(200).json({message:bulkjobs.length + ` new jobs are added`});
});

const dataForJobAlert = asyncHandler(async(req,res)=>{
    const [unqusers] = await db.query(`select user_id from jobalertusers`)
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    console.log(unqusers);
    let dest = [];
    const jobsPageLink = `${CLIENT}/all-job-opportunities.php`;
    for(let item of unqusers){
        const [data] = await db.query(`select firstname as name, email from userdetails where user_id = ?`,[item.user_id])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
        const name = data[0].name;
        const obj = {
            Destination: {
                ToAddresses: [data[0].email],
            },
            ReplacementTemplateData: JSON.stringify({"name":name,"jobsPageLink":jobsPageLink}),
        }
        console.log(obj.Destination.ToAddresses[0]);
        dest.push(obj);
    }
    // console.log(dest);
    await axios.post(`${SERVER}/portal/sendJobAlertMails`,dest)
                .then(res=>{
                    console.log(res.data);
                })
                .catch(err=>{
                    console.log(err);
                });
    return res.status(200).json("bulk mail data done");
})

const editJob = asyncHandler(async(req,res)=>{
    let {job_id,changedjob} = req.body;
    // console.log(req.body);
    changedjob = JSON.parse(changedjob);
    // console.log(changedjob);
    if(!job_id || !changedjob || !Object.keys(changedjob).length){
        return res.status(400).json({message:"empty data provided"});
    }
    try{
        await db.query(`update jobslisted set ? where job_id = ?`,[changedjob,job_id]);
        return res.status(200).json("job edited");
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Internal server error");
    } 
});

const deleteJob = asyncHandler (async (req,res)=>{
    const {jobId} = req.params;
    if(!jobId){
        return res.status(401).json({message:"all fields required"});
    }

    const sql = `delete from jobslisted where job_id = ?`;
    try{
        await db.query(sql,[jobId]);
        return res.status(200).json({message:"job deleted"});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

//delete a user
const deleteUser = asyncHandler(async(req,res)=>{
    const {user_id,role} = req.body;
    if(!user_id || !role){
        return res.status(401).json({message:"data required"});
    }
    if(role=="user"){
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
    }
    else if(role=="hr"){
        const [foundUser] = await db.query(`select hr_id from hraccounts where hr_id = ?`,[user_id]);
        if(!foundUser[0]){
            return res.status(201).json({message:"no hr found"});
        }

        const [hrdel] = await db.query(`delete from hraccounts where hr_id = ?`,[user_id])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                });
    }
    else if(role=="tpo"){
        const [foundUser] = await db.query(`select tpo_id from tpoaccounts where tpo_id = ?`,[user_id]);
        if(!foundUser[0]){
            return res.status(201).json({message:"no tpo found"});
        }

        const [tpodel] = await db.query(`delete from tpoaccounts where tpo_id = ?`,[user_id])
                .catch(err=>{
                    return res.status(400).json(err.sqlMessage);
                });
    }

    return res.status(200).json({message: role+" deleted"});
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
    let colleges = req.body;
    console.log(colleges);
    if(colleges.length === 0){
        return res.status(204).json({message:"no colleges data"});
    }
    for(let i=0;i<colleges.length;i++){
        const college = colleges[i];
        console.log(college);
        const addclg = await db.query(`insert into colleges set ?`,[college])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    }
    console.log("colleges added");
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

const changeUserStatus = asyncHandler(async(req,res)=>{
    const {userid,role,status} = req.body;
    // console.log(req.body);
    if(!userid || !status || !role){
        return res.status(400).json({message:"no content"});
    }
    let newstat = 0;
    if(status=="active"){
        newstat = 1; 
    }

    if(role=="user"){
        await db.query(`update useraccounts set ? where user_id = ?`,[{"isActive":newstat},userid])
            .catch(err=>{
                return res.status(400).json(err.sqlMessage);
            });
    }
    else if(role=="hr"){
        await db.query(`update hraccounts set ? where hr_id = ?`,[{"isActive":newstat},userid])
            .catch(err=>{
                return res.status(400).json(err.sqlMessage);
            });
    }
    else if(role=="tpo"){
        await db.query(`update tpoaccounts set ? where tpo_id = ?`,[{"isActive":newstat},userid])
            .catch(err=>{
                return res.status(400).json(err.sqlMessage);
            });
    }
    return res.status(200).json({message:"status changed"});
});

const addATraining = asyncHandler(async(req,res)=>{
    const training = req.body;
    if(!training || !Object.keys(training).length){
        return res.status(400).json("no training data");
    }

    try{
        await db.query(`insert into trainings set ?`,[training])
        return res.status(200).json("training added");
    }   
    catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
});


const addAWorkshop = asyncHandler(async(req,res)=>{
    const workshop = req.body;
    if(!workshop || !Object.keys(workshop).length){
        return res.status(400).json("no training data");
    }

    try{
        await db.query(`insert into workshops set ?`,[workshop])
        return res.status(200).json("workshop added");
    }   
    catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
});

const addACourse = asyncHandler(async(req,res)=>{
    let course = req.body;
    // console.log(course);
    // console.log(req?.file);
    let imgBuffer = req.file.buffer;
    const s3 = new S3Client({
        region: regionName,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretKey,
        },
    });

    const fileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
    const filePath = `courseThumbnails/${fileName()}`;

    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: imgBuffer,
      ContentType: req.file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);
        console.log("Object uploaded successfully:", response);
    } catch (error) {
        console.error("Error uploading object:", error);
    }
    course["thumbnailawspath"] = filePath;
    // console.log(course);
    await db.query(`insert into courses set ?`,[course])
            .catch(err=>{
                return res.status(500).json(err.sqlMessage);
            });        
    return res.status(200).json("course added");
})



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
    updateStats,
    getUsersOfACollege,
    changeUserStatus,
    getApplFromACollege,
    dataForJobAlert,
    addATraining,
    addAWorkshop,
    addACourse
}
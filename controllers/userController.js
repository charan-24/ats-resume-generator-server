const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const saltRounds = process.env.SALT_ROUNDS; 
const SERVER = process.env.SERVER;

// registration of user
const userRegistration = asyncHandler(async (req, res) => {
    const { username, password, cnfpassword, email, first_name, last_name, email_org, 
        phone_number, linkedinurl, qualification, specialization, college_id, 
        year_of_grad, cgpa_or_percentage, college_rollno, strength, weakness,
        workexp
    } = req.body;
    console.log(req.body);
    const [duplicate0] = await db.query(`select username, email from useraccounts where username = ? || email = ?`,[username,email])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    const [duplicate1] = await db.query(`select phone_number, emailorg from userdetails where phone_number = ? || emailorg = ?`,[phone_number,email_org]);
    console.log(duplicate1);
    if(duplicate0[0]?.username == username){
        return res.status(400).json({message:"usernameerror"});
    }
    else if(duplicate0[0]?.email == email){
        return res.status(400).json({message:"emailerror"});
    }
    else if(duplicate1[0]?.phone_number == phone_number){
        return res.status(400).json({message:"numbererror"});
    }
    else if(duplicate1[0]?.emailorg == email_org){
        return res.status(400).json({message:"emailorgerror"});
    }
    if(password !== cnfpassword){
        return res.status(400).json({message:"passwords doesn't match"})
    } 
    const hashpassword = await bcrypt.hash(password, parseInt(saltRounds));

    //adding userAccount details
    let ua=0;
    const useracctobj = {
        "username": username,
        "password": hashpassword,
        "email": email
    }
    const sqlUserAcct = `INSERT INTO useraccounts SET ?`;
    const account = await db.query(sqlUserAcct, useracctobj)
        .then((res) => {
            console.log("useraccount added");
        })
        .catch(err => {
            console.log(err);
            ua=1;
            return res.status(400).json({message:err.sqlMessage});
        });
    if(ua==1){
        return;
    }
    const [userid] = await db.query(`select user_id from useraccounts where username = ?`, [username]);
    console.log("userid:" + userid[0].user_id)

    //adding userDetails
    let ud=0;
    const userdetailsobj = {
        "user_id": userid[0].user_id,
        "username": username,
        "firstname": first_name,
        "lastname": last_name,
        "email": email,
        "emailorg": email_org,
        "phone_number": phone_number,
        "linkedinurl":linkedinurl || "",
        "strength": strength || "",
        "weakness": weakness || ""
    }

    const sqluserdetail = `insert into userdetails set ?`;
    const details = await db.query(sqluserdetail, userdetailsobj)
        .then(res => {
            console.log("details added");
        })
        .catch(err => {
            console.log(err);
            ud=1;
            return res.status(400).json({message:err.sqlMessage});
        });
        if(ud==1)
            return;
    //adding educationalDetails 
    const [college_name] = await db.query(`select collegename from colleges where college_id = ?`,[college_id])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage)
                                });
    let ed=0;
    const educationobj = {
        "user_id": userid[0].user_id,
        "username": username,
        "qualification": qualification,
        "specialization": specialization,
        "college_id":college_id,
        "college_name": college_name[0].collegename,
        "year_of_grad": year_of_grad,
        "cgpa_or_percentage": cgpa_or_percentage,
        "college_rollno": college_rollno
    }

    const sqleducation = `insert into educationaldetails set ?`;
    const education = await db.query(sqleducation, educationobj)
        .then(res => {
            console.log("education added");
        })
        .catch(err => {
            console.log(err);
            ed=1;
            return res.status(400).json({message:err.sqlMessage});
        });
    if(ed==1)
        return;

    //adding workExperience 
    let w=0;
    if(workexp){
        for(let i=0;i<workexp.length;i++){
            const work = workexp[i];
            const workobj = {
                "user_id":userid[0].user_id,
                "company_name":work.company_name,
                "job_title":work.job_title,
                "start_date":work.start_date,
                "end_date":work.end_date,
                "job_description":work.job_description,
                "technologies_used":work.technologies_used
            }
            const sqlwork = `insert into workexperience set ?`;
            const works = await db.query(sqlwork,workobj)
                                .catch(err=>{
                                    console.log(err);
                                    w=1;
                                    return res.status(400).json({message:err.sqlMessage});
                                })
            if(w==1){
                break;
            }
        }
    }
    if(w!=1){
        return res.status(200).json({message:"useradded",userid:userid[0].user_id});
    }
});

//select preferred roles
const selectPreferredRoles = asyncHandler(async(req,res)=>{
    let {user_id,preferredroles} = req.body;
    user_id = parseInt(user_id);
    preferredroles = JSON.parse(preferredroles);
    // console.log(preferredroles);
    let userpreferences = await db.query(`select * from preferredjobroles where user_id = ?`,[user_id])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    });
    
    for(let i=0;i<preferredroles.length;i++){
        // console.log(preferredroles[i]);
        const preferred = preferredroles[i];
        if(userpreferences[0].length>=1){
            const found = await userpreferences[0].find(role => role.jobrole_id === parseInt(preferred.jobrole_id));
            if(!found){
                const addrole = await db.query(`insert into preferredjobroles set ?`,{"user_id":user_id,"jobrole_id":parseInt(preferred.jobrole_id)})
                                        .catch(err=>{
                                            return res.status(400).json({message:err.sqlMessage});
                                        })
            }
        }
        else{
            const addrole = await db.query(`insert into preferredjobroles set ?`,{"user_id":user_id,"jobrole_id":parseInt(preferred.jobrole_id)})
                                        .catch(err=>{
                                            return res.status(400).json({message:err.sqlMessage});
                                        })
        }
    }

    userpreferences = await db.query(`select * from preferredjobroles where user_id = ?`,[user_id])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    });

    for(let i=0;i<userpreferences[0].length;i++){
        const preferred = userpreferences[0][i];
        const found = await preferredroles.find(role => parseInt(role.jobrole_id) === preferred.jobrole_id);
        if(!found){
            const addrole = await db.query(`delete from preferredjobroles where pref_id = ?`,[preferred.pref_id])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    })
        }
    }
    
    return res.status(200).json({message:"preferrences chnaged"});
});

const getPreferredRoles = asyncHandler(async(req,res)=>{
    const {userid} = req.params;
    // console.log(userid);
    if(!userid){
        return res.status(400).json({message:"no userid"});
    }
    const [preferred] = await db.query(`select jobrole_id from preferredjobroles where user_id = ?`,[userid])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    let arr = [];
    preferred.map(item => arr.push(item.jobrole_id));
    return res.status(200).json(arr);
})

const editUserProfile = asyncHandler(async(req,res)=>{
    const changesobj = req.body;
    // console.log(req.body);
    const user_id = changesobj.user_id;
    if(!changesobj || !user_id){
            return res.status(401).json({message:"no data provided"});
    }
    if(changesobj.password){
        const hashpassword = await bcrypt.hash(changesobj.password,parseInt(saltRounds));
        const changepwd = await db.query(`update useraccounts set ? where user_id = ?`,[{password: hashpassword},parseInt(user_id)])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    })
        console.log("password changed");
        // return res.sendStatus(200);
    }

    if(changesobj.email){
        const changeemail = await db.query(`update useraccounts set ? where user_id = ?`,[{email:changesobj.email},user_id])
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    })
        console.log("email changed");
        // return res.send(changesobj.email);
    }

    const details = {};
    for(let key in changesobj){
        if(key === "first_name" || key === "last_name" || key === "email" || key ==="email_org" || key === "phone_number" || key ==="city" || key === "strength" || key ==="weakness"){
            details[`${key}`]=changesobj[key]
        }
    }
    const sql = `update userdetails set ? where user_id = ?`;

    if(Object.keys(details).length>=1){
        const userdetail = await db.query(sql,[details,user_id])
                                    .then(res=>{
                                        console.log("userdetails changed");
                                    })
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    });
    }

    const education = {};
    for(let key in changesobj){
        if(key === "qualification" || key === "specialization" || key === "college_name" || key ==="year_of_grad" || key === "cgpa_or_percentage"){
            if(key === "cgpa_or_percentage"){
                education[`${key}`] = parseFloat(changesobj[key]);
            }
            education[`${key}`]=changesobj[key]
        }
    }
    const sqledu = `update educationaldetails set ? where user_id = ?`;
    // console.log(education);
    if(Object.keys(education).length>=1){
        const edu = await db.query(sqledu,[education,user_id])
                                    .then(res=>{
                                        console.log("educationaldetails changed");
                                    })
                                    .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                    });
    }
    return res.send("edit done");
});

const addWorkExp = asyncHandler(async(req,res)=>{
    const workexp = req.body;
    console.log(req.body);
    if(!workexp || !Object.keys(workexp).length){
        return res.status(400).json("empty");
    }
    const sql = `insert into workexperience set ?`;
    const addwork = await db.query(sql,workexp)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    return res.status(200).json("workadded");
});

const deleteWorkExp = asyncHandler(async(req,res)=>{
    const {work_id} = req.body;
    if(!work_id){
        return res.status(401).json({message:"work_id required"});
    }    

    const [foundwork] = await db.query(`select work_id from workexperience where work_id = ?`,[work_id]);
    if(!foundwork[0]){
        return res.status(401).json({message:"no work found"});
    }

    const delwork = await db.query(`delete from workexperience where work_id = ?`,[work_id])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    return res.status(200).json({message:"work deleted"});
});

const userLogin = asyncHandler(async(req,res)=>{
    const {username, password} = req.body;
    if(!username){
        return res.status(400).json({message:"username required"})
    }
    if(!password){
        return res.status(400).json({message:"password required"})        
    }
    const [foundUser] = await db.query(`select user_id, password, username, role from useraccounts where username = ? || email = ?`,[username,username]);
    // console.log(foundUser[0]);
    if(!foundUser[0] || !Object.keys(foundUser[0]).length){
        return res.status(401).json({message:"user not found"});
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
        const addrefreshtoken = await db.query(`update useraccounts set ? where user_id = ?`,[{last_login:logindate[0].logindate,"refreshToken":refreshToken},foundUser[0].user_id]);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000});
        return res.status(200).json({message:"success",accessToken,"userid":foundUser[0].user_id,"role":foundUser[0].role});
    }
    return res.status(400).json({message:"wrongpwd"});
});

const getPreferredJobs = asyncHandler(async(req,res)=>{
    const {userid} = req.params;
    if(!userid){
        return res.status(400).json({message:"userid required"});
    }
    const preferredsql = `select * from jobslisted, preferredjobroles as pr where pr.user_id = ? and pr.jobrole_id = jobslisted.jobrole_id order by jobslisted.posted_date`; 
    const [preferredjobs] = await db.query(preferredsql,[userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    return res.status(200).json(preferredjobs);
});

const addProject = asyncHandler(async(req,res)=>{
    const {project} = req.body;
    console.log(project);
    if(!project || !Object.keys(project).length){
        return res.status(400).json({message:"empty project data"});
    }
    const [addproj] = await db.query(`insert into userprojects set ?`,project)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json(addproj.insertId);
}); 

const getuserprojects = asyncHandler(async(req,res)=>{
    const user_id = req.params.userid;
    if(!user_id){
        return res.status(400).json({message:"no user_id"});
    }

    const getproj = await db.query(`select * from userprojects where user_id = ?`,[user_id])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json(getproj[0]);

});

const addCertificate = asyncHandler(async(req,res)=>{
    const certificate = req.body;
    console.log(certificate);
    if(!certificate || !Object.keys(certificate).length){
        return res.status(400).json({message:"empty data"});
    }

    const [addcert] = await db.query(`insert into usercertificates set ?`,certificate)
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    return res.status(200).json(addcert.insertId);

});

const getUserResumes = asyncHandler(async(req,res)=>{
    const userid = req.params.userid;

    if(!userid){
        return res.status(400).json("no userid");
    }

    const [resumes] = await db.query(`select * from userresumes where user_id = ?`,[userid])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    // console.log(resumes[0]);
    return res.status(200).json(resumes);
});

const getUserCertificates = asyncHandler(async(req,res)=>{
    const userid = req.params.userid;

    if(!userid){
        return res.status(400).json("no userid");
    }

    const [certificates] = await db.query(`select * from usercertificates where user_id = ?`,[userid])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                });
    // console.log(resumes[0]);
    return res.status(200).json(certificates);
});

const getUserDetails = asyncHandler(async(req,res)=>{
    const {userid} = req.params;
    if(!userid){
        return res.status(400).json("no userid");
    }

    const [details] = await db.query('select ud.*,ua.resumesused,ua.resumesplan,ua.subscribed from userdetails ud join useraccounts ua on ud.user_id = ua.user_id where ud.user_id = ? and ua.user_id = ?',[userid,userid])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            })
    const [education] = await db.query('select * from educationaldetails where user_id = ?',[userid])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });                       
    // const resumes = await db.query('select resumesplan,resumesused from useraccounts where user_id = ?',[userid])
    //                             .catch(err=>{
    //                                 return res.status(400).json(err.sqlMessage);
    //                             });

    const projects = await db.query('select * from userprojects where user_id = ?',[userid])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    const workexp = await db.query('select * from workexperience where user_id = ?',[userid])
                                .catch(err=>{
                                    return res.status(400).json(err.sqlMessage);
                                });
    const certificates = await db.query('select * from usercertificates where user_id = ?',[userid])
                            .catch(err=>{
                                return res.status(400).json(err.sqlMessage);
                            });
    const [preferred] = await db.query(`select jobrole_id from preferredjobroles where user_id = ?`,[userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    let preferredarr = [];
    preferred.map(item => preferredarr.push(item.jobrole_id));
    const [jobroles] = await db.query(`select * from jobroles`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage})
                                });
    const preferredsql = `select * from jobslisted, preferredjobroles as pr where pr.user_id = ? and pr.jobrole_id = jobslisted.jobrole_id order by jobslisted.posted_date`; 
    const [preferredjobs] = await db.query(preferredsql,[userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            })
    
    let overview = {};
    overview["details"] = details[0];
    // overview["resumes"] = resumes[0];
    overview["education"] = education[0];
    overview["projects"] = projects[0];
    overview["workexp"] = workexp[0];
    overview["certificates"] = certificates[0];
    overview["preferredroles"] = preferredarr;
    overview["jobroles"] = jobroles;
    overview["preferredjobs"] = preferredjobs;
    let userpfp=null;
    await axios.get(SERVER+`/pfp/getpfp/${userid}`)
                                .then(res=>{
                                    userpfp = res.data;
                                })
                                .catch(err=>{
                                    console.log(err);
                                });
    overview["userpfp"] = userpfp;
    return res.status(200).json(overview);
});

const getAllJobRoles = asyncHandler(async(req,res)=>{
    const [jobroles] = await db.query(`select * from jobroles`)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage})
                                });
    // console.log(jobroles)
    return res.status(200).json(jobroles);
})

const resetPassword = asyncHandler(async(req,res)=>{
    const reset = req.body;
    console.log(reset);
    if(!reset || Object.keys(reset).length<3){
        return res.status(400).json({message:"all fields required"});
    }

    const [user] = await db.query(`select * from useraccounts where user_id = ?`,[reset.userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    const [hr] = await db.query(`select * from hraccounts where hr_id = ?`,[reset.userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    const [tpo] = await db.query(`select * from tpoaccounts where tpo_id = ?`,[reset.userid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    if(!user[0] && !hr[0] && !tpo[0]){
        return res.status(400).json({message:"no user found"});
    }
    else if(user[0]){
        const match = await bcrypt.compare(reset.token, user[0].resetToken);
        if(match){
            const hashpwd = await bcrypt.hash(reset.password,parseInt(saltRounds));
            const resetpwd = await db.query(`update useraccounts set ? where user_id = ?`,[{password:hashpwd},reset.userid])
                                        .catch(err=>{
                                            return res.status(400).json({message:err.sqlMessage});
                                        });
        }
        else{
            return res.status(401).json({message:"unauthorized password reset, try again"})
        }
        console.log("password updated");
    }
    else if(hr[0]){
        const match = await bcrypt.compare(reset.token, hr[0].resetToken);
        if(match){
            const hashpwd = await bcrypt.hash(reset.password,parseInt(saltRounds));
            const resetpwd = await db.query(`update hraccounts set ? where hr_id = ?`,[{password:hashpwd},reset.userid])
                                        .catch(err=>{
                                            return res.status(400).json({message:err.sqlMessage});
                                        });
        }
        else{
            return res.status(401).json({message:"unauthorized password reset, try again"})
        }
        console.log("password updated");

    }
    else if(tpo[0]){
        const match = await bcrypt.compare(reset.token, tpo[0].resetToken);
        if(match){
            const hashpwd = await bcrypt.hash(reset.password,parseInt(saltRounds));
            const resetpwd = await db.query(`update tpoaccounts set ? where tpo_id = ?`,[{password:hashpwd},reset.userid])
                                        .catch(err=>{
                                            return res.status(400).json({message:err.sqlMessage});
                                        });
        }
        else{
            return res.status(401).json({message:"unauthorized password reset, try again"})
        }
        console.log("password updated");

    }
    return res.status(200).json({message:"password resetted"});

});

const verifymail = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    if(!email){
        return res.status(400).json({error:"no email or userid"});
    }

    const [found] = await db.query(`select user_id,email from useraccounts where email = ?`,[email])
                            .catch(err=>{
                                return res.status(400).json({error:err.sqlMessage});
                            });
    const [foundhr] = await db.query(`select hr_id,emailorg,firstname from hraccounts where emailorg = ?`,[email])
                            .catch(err=>{
                                return res.status(400).json({error:err.sqlMessage});
                            });
    const [foundtpo] = await db.query(`select tpo_id,emailorg,firstname from tpoaccounts where emailorg = ?`,[email])
                            .catch(err=>{
                                return res.status(400).json({error:err.sqlMessage});
                            });
    
    if(!found[0] && !foundhr[0] && !foundtpo[0]){
        return res.status(400).json({error:"email not found"});
    }
    else if(found[0]){
        const postData = {
            userid: found[0].user_id, // User ID from your 'found' array
            email: email,             // Email address
            role: 'user',             // User role
            username: found[0].username // Username from the 'found' array
          };
        axios.post(`${SERVER}/portal/sendResetPasswordMail`,postData)
                    .then(res=>{
                        console.log(res.data);
                    })
                    .catch(err=>{
                        console.log(err);
                    });
    }
    else if(foundhr[0]){
        const postData = {
            userid: foundhr[0].hr_id, // User ID from your 'found' array
            email: email,             // Email address
            role: 'hr',             // User role
            username: foundhr[0].firstname // Username from the 'found' array
          };
          console.log(postData);
        axios.post(`${SERVER}/portal/sendResetPasswordMail`,postData)
                    .then(res=>{
                        console.log(res.data);
                    })
                    .catch(err=>{
                        console.log(err);
                    });

    }
    else if(foundtpo[0]){
        const postData = {
            userid: foundtpo[0].tpo_id, // User ID from your 'found' array
            email: email,             // Email address
            role: 'tpo',             // User role
            username: foundtpo[0].firstname // Username from the 'found' array
          };
        axios.post(`${SERVER}/portal/sendResetPasswordMail`,postData)
                    .then(res=>{
                        console.log(res.data);
                    })
                    .catch(err=>{
                        console.log(err);
                    });
    }
    return res.status(200).json({message:"success"});
});

module.exports = {
    userRegistration,
    selectPreferredRoles,
    getPreferredRoles,
    editUserProfile,
    userLogin,
    addWorkExp,
    deleteWorkExp,
    getPreferredJobs,
    addProject,
    getuserprojects,
    addCertificate,
    getUserResumes,
    getUserCertificates,
    getUserDetails,
    getAllJobRoles,
    resetPassword,
    verifymail
}

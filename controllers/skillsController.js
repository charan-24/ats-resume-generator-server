const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const axios = require('axios');
const {S3Client, PutObjectCommand, GetObjectCommand} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const SERVER = process.env.SERVER;
const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET;

const getTrainings = asyncHandler(async(req,res)=>{
    const [trainings] = await db.query(`select * from trainings`)
                                .catch(err=>{
                                    return res.status(500).json(err.sqlMessage);
                                });
    const skills = {};
    skills["trainings"] = trainings
    return res.status(200).json(skills);
});

const getCourses = asyncHandler(async(req,res)=>{
    const [courses] = await db.query(`select * from courses`)
                                .catch(err=>{
                                    return res.status(500).json(err.sqlMessage);
                                });
    let promises = courses.map(course => {
        return axios.get(`${SERVER}/skills/getThumbnail/${course.course_id}`)
            .then(res => {
                course.thumbnailawspath = res.data;
            })
            .catch(err => {
                console.error(err);
                throw err; // Rethrow the error to ensure Promise.all catches it
            });
    });
    
    Promise.all(promises)
        .then(() => {
            // console.log('All courses updated:', courses);
            const skills = {};
            // console.log(courses);
            skills["courses"] = courses
            return res.status(200).json(skills);
            // Do whatever needs to be done after all courses have been updated
        })
        .catch(err => {
            console.error('Error updating courses:', err);
            // Handle the error as needed
            return res.status(500).json(err);
        });
});

const getThumbnail = asyncHandler(async(req,res)=>{
    const { courseId } = req.params;
    // console.log(userid);
    if (!courseId) {
        return res.status(400).json("empty data");
    }

    const [thumbnailpath] = await db.query(`select thumbnailawspath from courses where course_id = ?`,[courseId])
                                .catch((err) => {
                                return res.status(400).json({ message: err.sqlMessage });
                                });
    // console.log(pfppath[0]);
    if(!thumbnailpath[0]){
        return res.status(400).json(null);
    }
    const s3 = new S3Client({
        region: regionName,
        credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretKey,
        },
    });
    const params = {
        Bucket: bucketName,
        Key: thumbnailpath[0].thumbnailawspath,
    };
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.send(url);
});

const getUserTrainings = asyncHandler(async(req,res)=>{
    const {userId} = req.params;
    if(!userId){
        return res.status(400).json("no userId");
    }

    const [myTrainings] = await db.query(`select t.* from trainings t join trainingsapplied ta on ta.training_id = t.training_id where user_id = ?`,[userId])
                                    .catch(err=>{
                                        return res.status(500).json(err);
                                    });
    // console.log(myTrainings);
    const skills = {};
    skills["myTrainings"] = myTrainings
    return res.status(200).json(skills);
});

const getWorkshops = asyncHandler(async(req,res)=>{
    const [workshops] = await db.query(`select w.*, c.collegename as college from workshops w join colleges c on w.college_id = c.college_id`)
                                .catch(err=>{
                                    return res.status(500).json(err.sqlMessage);
                                });
    const skills = {};
    skills["workshops"] = workshops
    return res.status(200).json(skills);
});

const editTraining = asyncHandler(async(req,res)=>{
    let {trainingId,training} = req.body;
    training = JSON.parse(training);
    console.log(trainingId,training);
    if(!trainingId || !training || !Object.keys(training)){
        return res.status(400).json("no data");
    };
    try{
        await db.query(`update trainings set ? where training_id = ?`,[training,trainingId])
        return res.status(200).json(`training edited`)
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const deleteTraining = asyncHandler(async(req,res)=>{
    const {trainingId} = req.params;
    console.log(req.params);
    if(!trainingId){
        return res.status(400).json("no data");
    }
    try{
        await db.query(`delete from trainings where training_id = ?`,[trainingId]);
        return res.status(200).json(`training deleted`) 
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const editCourse = asyncHandler(async(req,res)=>{
    let course = req.body;
    // course = JSON.parse(course);
    console.log(course);
    console.log(req?.file)
    if(!course || !Object.keys(course)){
        return res.status(400).json("no data");
    };
    if(req?.file){
        let imgBuffer = req?.file?.buffer;
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
            ContentType: req?.file?.mimetype,
        };

        try {
            const command = new PutObjectCommand(params);
            const response = await s3.send(command);
            console.log("Object uploaded successfully:", response);
            course["thumbnailawspath"] = filePath;
        } catch (error) {
            console.error("Error uploading object:", error);
            return res.status(500).json("Error uploading object");
        }
    }

    try {
        await db.query(`UPDATE courses SET ? WHERE course_id = ?`, [course, course.course_id]);
        return res.status(200).json("Course edited");
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json("Internal server error");
    }
});

const deleteCourse = asyncHandler(async(req,res)=>{
    const {courseId} = req.params;
    console.log(courseId);
    if(!courseId){
        return res.status(400).json("no data");
    }
    try{
        await db.query(`delete from courses where course_id = ?`,[courseId]);
        return res.status(200).json(`course deleted`) 
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const editWorkshop = asyncHandler(async(req,res)=>{
    let {workshopId,workshop} = req.body;
    workshop = JSON.parse(workshop);
    console.log(workshop);
    if(!workshopId || !workshop || !Object.keys(workshop).length){
        return res.status(400).json("no workshop data");
    }

    try{
        await db.query(`update workshops set ? where workshop_id = ?`,[workshop,workshopId])
        return res.status(200).json(`workshop ${workshopId} updated`);
    }   
    catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
});

const deleteWorkshop = asyncHandler(async(req,res)=>{
    const {workshopId} = req.params;
    console.log(workshopId);
    if(!workshopId){
        return res.status(400).json("no data");
    }
    try{
        await db.query(`delete from workshops where workshop_id = ?`,[workshopId]);
        return res.status(200).json(`workshop deleted`) 
    }
    catch(error){
        console.error(error);
        return res.status(500).json("Internal server error");
    }
});

const getTrainingRegisteredUsers = asyncHandler(async(req,res)=>{
    const registered = {};
    const [trainings] = await db.query(`select ta.*, t.title, t.registrationfee, u.username, u.firstname, u.lastname from trainingsapplied ta
                                        join trainings t on ta.training_id = t.training_id
                                        join userdetails u on ta.user_id = u.user_id`)
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    registered["trainings"] = trainings;

    return res.status(200).json(registered);
});

module.exports = {
    getTrainings,
    getCourses,
    getThumbnail,
    getUserTrainings,
    getWorkshops,
    editTraining,
    deleteTraining,
    editCourse,
    deleteCourse,
    editWorkshop,
    deleteWorkshop,
    getTrainingRegisteredUsers
}
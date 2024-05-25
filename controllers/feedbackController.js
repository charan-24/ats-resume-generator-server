const asyncHandler = require('express-async-handler');
const db = require('../database/database');
const axios = require('axios');
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


const submitFeedback = asyncHandler(async(req,res)=>{
    const {user_id,fullname,email,category,subject,description,urgency,contact_method} = req.body;
    console.log(req.body);
    const feedbackobj = {
        "user_id":user_id,
        "fullname":fullname,
        "email":email,
        "category":category,
        "subject":subject,
        "description":description,
        "urgency":urgency,
        "contact_method":contact_method,
    };

    const sql = `insert into feedbacks set ?`;
    const [feedback] = await db.query(sql,feedbackobj)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage})
                                });
    console.log(feedback);
    await axios.post(`${SERVER}/portal/sendFeedbackMail`,{"name":feedbackobj.fullname,"email":feedbackobj.email})
                .then(res=>{
                    console.log(res.data);
                })
                .catch(err=>{
                    console.log(err);
                });

    return res.status(200).json({message:"feedback submitted",feedback_id:feedback.insertId});
});

const displayFeedbacks = asyncHandler(async(req,res)=>{
    const feedbacksql = `select * from feedbacks order by issue_date`;
    const feedbacks = await db.query(feedbacksql)
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                })
    return res.status(200).json(feedbacks[0]);
});

const changeStatus = asyncHandler(async(req,res)=>{
    const {feedback_id,status}  = req.body;
    console.log(feedback_id,status);
    if(!feedback_id || !status){
        return res.status(400).json("empty data");
    }

    const changestatus = await db.query(`update feedbacks set ? where feedback_id = ?`,[{status},feedback_id])
                                    .catch(err=>{
                                        return res.status(400).json(err.sqlMessage);
                                    });
    return res.status(200).json("status changed");
});

const uploadFeedbackScreenshot = asyncHandler(async(req,res)=>{
    const {feedbackId} = req.params;
    let screenshotBuffer = req?.file?.buffer;
    // console.log(screenshotBuffer);

    const s3 = new S3Client({
        region: regionName,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretKey,
        },
    });

    const fileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
    const filePath = `feedbackScreenshots/${fileName()}`;

    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: screenshotBuffer,
      ContentType: req.file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        const response = await s3.send(command);
        console.log("Object uploaded successfully:", response);
    } catch (error) {
        console.error("Error uploading object:", error);
    }

    await db.query(`update feedbacks set ? where feedback_id = ?`,[{feedbackSSawspath:filePath},feedbackId])
            .catch(err=>{
                return res.status(400).json(err.sqlMessage);
            });
    return res.status(200).json("screenshot uploaded");
});  

const getFeedbacks = asyncHandler(async (req, res) => {
    const [feedbacks] = await db.query(`SELECT * FROM feedbacks`).catch(err => {
      return res.status(500).json(err.sqlMessage);
    });
  
    let promises = feedbacks.map(feedback => {
    if (!feedback.feedbackSSawspath) {
        // Skip if feedbackSSawspath is null
        feedback.feedbackSSawspath = null;
        return Promise.resolve();
    }
    // console.log(`Fetching screenshot for feedback ID: ${feedback.feedback_id}`);
    return axios.get(`${SERVER}/feedback/getFeedbackScreenshot/${feedback.feedback_id}`, {
                headers: {
                'Accept': 'application/json',
                'User-Agent': 'axios/1.6.8',
                },
            })
            .then(response => {
                feedback.feedbackSSawspath = response.data;
            })
            .catch(err => {
                console.error(`Error fetching screenshot for feedback ID: ${feedback.feedback_id}`, err);
                throw err; // Rethrow the error to ensure Promise.all catches it
            });
    });
  
    Promise.all(promises)
      .then(() => {
        const feedbacksdata = { feedbacks };
        return res.status(200).json(feedbacksdata);
      })
      .catch(err => {
        console.error('Error updating feedbacks:', err);
        return res.status(500).json({ message: 'Error updating feedbacks', details: err.message });
      });
  });
  

  const getFeedbackScreenshot = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    if (!feedbackId) {
      return res.status(400).json("Empty feedback ID");
    }
  
    const [feedbackpath] = await db.query(`SELECT feedbackSSawspath FROM feedbacks WHERE feedback_id = ?`, [feedbackId]).catch(err => {
      return res.status(400).json({ message: err.sqlMessage });
    });
  
    if (!feedbackpath[0] || !feedbackpath[0].feedbackSSawspath) {
      return res.status(400).json("Feedback path not found");
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
      Key: feedbackpath[0].feedbackSSawspath,
    };
  
    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return res.send(url);
    } catch (err) {
      console.error('Error generating signed URL', err);
      return res.status(500).json({ message: 'Error generating signed URL', details: err.message });
    }
  });
  

module.exports = {
    submitFeedback,
    displayFeedbacks,
    changeStatus,
    uploadFeedbackScreenshot,
    getFeedbacks,
    getFeedbackScreenshot
}
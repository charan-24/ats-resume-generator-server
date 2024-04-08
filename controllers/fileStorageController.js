const db = require('../database/database');
const asyncHandler = require('express-async-handler');
const {S3Client, PutObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Upload } = require('@aws-sdk/lib-storage');
const crypto = require('crypto');
const {jsPDF} = require('jspdf');
const axios = require("axios");

const accessKeyId = process.env.AWS_ACCESS_KEYID;  
const secretKey = process.env.AWS_SECRET_KEY;  
const regionName = process.env.S3_REGION;  
const bucketName = process.env.S3_BUCKET;

const storeResume = asyncHandler(async(req,res)=>{
    const {user_id} = req.body;

    const doc = new jsPDF();

    doc.text('Hello world',10,10);
    doc.text('Java world',20,20);
    doc.text('Nodejs world',30,30); 
    let pdfBuffer = doc.output('arraybuffer');
    pdfBuffer = Buffer.from(new Uint8Array(pdfBuffer));
    // let pdfBuffer;
    // await axios.get('http://localhost:5000/resume/jsonToPdf')
    //             .then(res=>{
    //                 pdfBuffer = res.data;
    //             })
    //             .catch(err=>{
    //                 console.log(err);
    //             });

    console.log(pdfBuffer);
    const s3 = new S3Client({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

    const fileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
    const filePath = `userResumes/${fileName()}`;

    const params = {
        Bucket: bucketName,
        Key: filePath,
        Body: pdfBuffer,
        ContentType: "application/pdf"
    }
    console.log(pdfBuffer)
    await s3.send(new PutObjectCommand(params));
    await db.query(`insert into userresumes set ?`,{"user_id":user_id,"resumeawspath":filePath})
            .catch(err=>{
                return res.status(400).json({message:err.sqlMessage});
            });

    res.send("done");
});

const getResume = asyncHandler(async(req,res)=>{
    const {resume_id} = req.body;
    if(!resume_id){
    return res.status(400).json("empty data");
    }

    const [resumepath] = await db.query(`select resumeawspath from userresumes where resume_id = ?`,[resume_id])
                                .catch(err=>{
                                    return res.status(400).json({message:err.sqlMessage});
                                })
    // console.log(resumepath[0].resumeawspath);
    const s3 = new S3Client({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });
    const params = {
        Bucket: bucketName,
        Key: resumepath[0].resumeawspath,
    }
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.send(url);
});

module.exports = {
    storeResume,
    getResume
}
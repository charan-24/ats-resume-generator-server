const db = require('../database/database');
const asyncHandler = require('express-async-handler');

const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
  } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { Upload } = require("@aws-sdk/lib-storage");
const crypto = require("crypto");


const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET;

const uploadPfp = asyncHandler(async(req,res)=>{
    const {userid} = req.params
    // console.log("userid",userid);
    const pfpbody = req.body;
    console.log("req.file",req.file);
    const imgBuffer = req.file.buffer; 
    // console.log(req);
    const s3 = new S3Client({
        region: regionName,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretKey,
        },
    });

    const fileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
    const filePath = `userPfps/${fileName()}`;

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

    const [found] = await db.query(`select * from userpfps where user_id = ?`,[userid])
                            .catch(err=>{
                                return res.status(200).json({message:err.sqlMessage});
                            });
    console.log(found);
    if(!found.length || !found[0]){
        await db.query(`insert into userpfps set ?`,{
            "user_id":userid,
            "pfpawspath": filePath
        })
        .catch(err=>{
            return res.status(400).json({message:err.sqlMessage})
        });
    }
    else{
        await db.query(`update userpfps set ?`, {
            "user_id": userid,
            "pfpawspath": filePath,
          })
          .catch((err) => {
            return res.status(400).json({ message: err.sqlMessage });
        });
    }

    return res.status(200).json({message:"pfp-uploaded-successfully"});
});

const getPfp = asyncHandler(async(req,res)=>{
    const { userid } = req.params;
    // console.log(userid);
    if (!userid) {
        return res.status(400).json("empty data");
    }

    const [pfppath] = await db
        .query(`select pfpawspath from userpfps where user_id = ?`, [
        userid,
        ])
        .catch((err) => {
        return res.status(400).json({ message: err.sqlMessage });
        });
    // console.log(resumepath[0].resumeawspath);
    const s3 = new S3Client({
        region: regionName,
        credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretKey,
        },
    });
    const params = {
        Bucket: bucketName,
        Key: pfppath[0].pfpawspath,
    };
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return res.send(url);
});

module.exports = {
    uploadPfp,
    getPfp
}
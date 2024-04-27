const {SESClient, SendTemplatedEmailCommand, SendEmailCommand} = require('@aws-sdk/client-ses');
const db = require('../database/database');
const asyncHandler = require('express-async-handler');
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = process.env.SALT_ROUNDS; 
const CLIENT = process.env.CLIENT;


const accessKeyId = process.env.AWS_ACCESS_KEYID;  
const secretKey = process.env.AWS_SECRET_KEY;  
const regionName = process.env.S3_REGION;
const senderMail = process.env.SENDER_MAIL;

const sendWelcomeMail = asyncHandler(async(req,res)=>{

    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

    const name = "Saicharan";
    const dashboard = "education.jacinthpaul.com";
    const support = "support@jacinth.com";
    const recipentMail = senderMail;
    const templateName = "WelcomeMailTemplate";

    console.log(recipentMail)

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,dashboard,support}),
    };

    const sendCmd = new SendTemplatedEmailCommand(input);
    const response = await client.send(sendCmd);
    console.log(response);
    return res.sendStatus(200);
});

const sendWelcomeBackMail = asyncHandler(async(req,res)=>{

    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

    const name = "Saicharan";
    const dashboardLink = "education.jacinthpaul.com";
    const newFeaturesList = "support@jacinth.com";
    const recipentMail = "saicharan@jacinthpaul.com";
    const templateName = "WelcomeBackMailTemplate";

    console.log(recipentMail)

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,dashboardLink,newFeaturesList}),
    };

    const sendCmd = new SendTemplatedEmailCommand(input);
    const response = await client.send(sendCmd);
    console.log(response);
    return res.sendStatus(200);
});

const sendResetPasswordMail = asyncHandler(async(req,res)=>{
    const {userid,email,role,username} = req.body;
    console.log(username);
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

    const name = username || role;
    const recipentMail = email;
    const templateName = "ResetPasswordTemplate";

    // console.log(recipentMail)
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = await bcrypt.hash(resetToken, parseInt(saltRounds));
    const resetLink = CLIENT+`/reset-password.php/?token=${resetToken}&user_id=${userid}`;
    // console.log(resetLink);
    if(role == "user"){
        const updateResetToken = await db.query(`update useraccounts set ? where user_id = ?`,[{resetToken:hashToken},userid])
                                     .then(res=>{
                                        console.log("resetToken updated");
                                     })
                                     .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                     });
    }
    else if(role == "hr"){
        const updateResetToken = await db.query(`update hraccounts set ? where hr_id = ?`,[{resetToken:hashToken},userid])
                                     .then(res=>{
                                        console.log("resetToken updated");
                                     })
                                     .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                     });
    }
    else if(role == "tpo"){
        const updateResetToken = await db.query(`update tpoaccounts set ? where tpo_id = ?`,[{resetToken:hashToken},userid])
                                     .then(res=>{
                                        console.log("resetToken updated");
                                     })
                                     .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                     });
    }
    

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,resetLink}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("success");
});



module.exports = {
    sendWelcomeMail,
    sendWelcomeBackMail,
    sendResetPasswordMail
}
const {SESClient, SendTemplatedEmailCommand, SendEmailCommand} = require('@aws-sdk/client-ses');
const db = require('../database/database');
const asyncHandler = require('express-async-handler');
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = process.env.SALT_ROUNDS; 


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
    const recipentMail = senderMail;
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
    const {userid} = req.body;

    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

    const name = "Saicharan";
    const recipentMail = senderMail;
    const templateName = "ResetPasswordTemplate";

    // console.log(recipentMail)
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = await bcrypt.hash(resetToken, parseInt(saltRounds));
    const resetLink = `http://localhost:3000/reset-password.php/?token=${resetToken}&user_id=${userid}`;

    const updateResetToken = await db.query(`update useraccounts set ? where user_id = ?`,[{resetToken:hashToken},userid])
                                     .then(res=>{
                                        console.log("resetToken updated");
                                     })
                                     .catch(err=>{
                                        return res.status(400).json({message:err.sqlMessage});
                                     });

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
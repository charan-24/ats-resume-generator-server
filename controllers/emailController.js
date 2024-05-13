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
    const {name} = req.body;
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });

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
    return res.status(200).json("welcome mail sent");
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
    if(!userid)
        return res.status(400).json({message:"no user"});
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
    const templateName = "ForgotPasswordMailTemplate";

    // console.log(recipentMail)
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = await bcrypt.hash(resetToken, parseInt(saltRounds));
    const resetLink = CLIENT+`/reset-password.php?token=${resetToken}&user_id=${userid}`;
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
        TemplateData: JSON.stringify({resetLink}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("resetpwd mail sent");
});

const sendPaymentConfirmMail = asyncHandler(async(req,res)=>{
    const {name,email,support,dashboard,expiryDate,startDate,subscriptionPlan,paymentAmount} = req.body;
    const mailData = req.body;
    console.log(mailData);
    if(!mailData)
        return res.status(400).json({message:"no user"});
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });
    const recipentMail = email;
    const templateName = "PaymentConfirmationMailTemplate";
    
    // console.log(resetLink);

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,paymentAmount,subscriptionPlan,startDate,expiryDate,dashboard,support}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("payment confirm mail sent");
});

const sendResumeRequestMail = asyncHandler(async(req,res)=>{
    const {name,email} = req.body;
    if(!name || !email)
        return res.status(400).json({message:"no user"});
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });
    const resumeRequestLink = `${CLIENT}/create-resume.php`
    const recipentMail = email;
    const templateName = "ResumeRequestMailTemplate";
    
    // console.log(resetLink);

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,resumeRequestLink}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("reseume req mail sent");
});

const sendResumeDownloadMail = asyncHandler(async(req,res)=>{
    const {name,email} = req.body;
    if(!name || !email)
        return res.status(400).json({message:"no user"});
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });
    const downloadLink = `${CLIENT}/create-resume.php`;
    const resourceLink = `${CLIENT}/all-job-opportunities.php`;
    const recipentMail = email;
    const templateName = "DownloadResumeMailTemplate";
    
    // console.log(resetLink);

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name,downloadLink,resourceLink}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("resume download mail sent");
});

const sendFeedbackMail = asyncHandler(async(req,res)=>{
    const {name,email} = req.body;
    if(!name || !email)
        return res.status(400).json({message:"no user"});
    const client = new SESClient({
        region: regionName,
        credentials:{
            accessKeyId: accessKeyId,
            secretAccessKey: secretKey
        }
    });
    const recipentMail = email;
    const templateName = "FeedbackRequestMailTemplate";
    
    // console.log(resetLink);

    const input = {
        Destination: {
            ToAddresses: [
                recipentMail
            ],
        },
        Source: senderMail,
        Template: templateName,
        TemplateData: JSON.stringify({name}),
    };
    try{
        const sendCmd = new SendTemplatedEmailCommand(input);
        const response = await client.send(sendCmd);
        console.log(response);
    }
    catch(err){
        return res.status(400).json("error");
    }
    return res.status(200).json("feedback ack mail sent");
});


module.exports = {
    sendWelcomeMail,
    sendWelcomeBackMail,
    sendResetPasswordMail,
    sendPaymentConfirmMail,
    sendResumeRequestMail,
    sendResumeDownloadMail,
    sendFeedbackMail
}
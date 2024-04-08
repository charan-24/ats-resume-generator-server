const {SESClient, SendTemplatedEmailCommand, SendEmailCommand} = require('@aws-sdk/client-ses');
const db = require('../database/database');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

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


module.exports = {
    sendWelcomeMail
}
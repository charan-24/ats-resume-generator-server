const { SESClient, CreateTemplateCommand, UpdateTemplateCommand } = require("@aws-sdk/client-ses"); // CommonJS import
require('dotenv').config();
console.log(process.env.S3_REGION);
const accessKeyId = process.env.AWS_ACCESS_KEYID;  
const secretKey = process.env.AWS_SECRET_KEY;  
let regionName = process.env.S3_REGION;

const client = new SESClient({
    region: regionName,
    credentials:{
        accessKeyId: accessKeyId,
        secretAccessKey: secretKey
    }
});

const createTemplate = async ()=>{
    const template = {
        Template: { // Template
            TemplateName: "WelcomeMailTemplate", // required      
            SubjectPart: `Welcome to Your Learning Journey at Jacinth Paul Academy!`,
            HtmlPart: `<html>
            <head>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header, .footer {
                        background: linear-gradient(171.45deg, #00B3B4 18.9%, #064E9B 100.71%);
                        color: #ffffff;
                        text-align: center;
                        padding: 20px;
                        border-radius: 8px 8px 0 0;
                    }
                    .logo {
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin: 0;
                  }
                    .logo img {
                        max-width: 150px;
                        height: auto;
                    }
                    .header h2 {
                        display: inline-block;
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                        margin-left: 10px;
                        vertical-align: middle;
                    }
                    .mail-content {
                        margin-top: 20px;
                        padding: 20px;
                        border-top: 1px solid #ddd;
                        border-bottom: 1px solid #ddd;
                    }
                    .mail-content p {
                        font-size: 16px;
                        line-height: 1.5;
                        margin-bottom: 10px;
                    }
                    .mail-content ul {
                        list-style-type: disc;
                        margin-left: 20px;
                    }
                    .mail-content li {
                      font-size: 16px;
                        margin-bottom: 5px;
                    }
                    .mail-content a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    .footer {
                        margin-top: 20px;
                        border-radius: 0 0 8px 8px;
                    }
                    .footer a {
                      text-decoration: none;
                      color: #ffffff;
                      line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">
                            <img src="https://drive.google.com/uc?id=1-VFOZGTOE-omRc0KXKEPNvFGGKH0HLeG" width="30" height="30" alt="Company Logo">
                            <h2>Jacinth Paul Academy</h2>
                        </div>
                    </div>
                    <div class="mail-content">
                    <p>Dear {{name}}, </p>
                        <p>Welcome to Jacinth Paul Academy! We're excited to have you on board as you embark on your path to becoming a future leader in engineering</p>
                        <p>Here’s what you can look forward to:</p>
                        <ul>
                            <li><b>Tailored Job Updates: </b> Custom alerts that match your career goals.</li>
                            <li><b>ATS-Friendly Resume Building: </b>Easily create standout resumes.</li>
                            <li><b>Exclusive Events Access: </b>Access to hackathons, contests, and meet-ups.</li>
                            <li><b>New Skills Development Section: </b>Dive into courses, trainings, workshops, and our interactive coding playground.</li>
                        </ul>
                        <p>Start exploring now: <a href="{{dashboard}}">Dashboard</a></p>
                        <p>Need help or have questions? Contact us anytime at {{support}}.</p>
                        <p>Best regards, <br>The Jacinth Paul Academy Team</p>
                      </div>
                      <div class="footer">
                      <a href="https://education.jacinthpaul.com/privacy-policy/"
                        >Privacy Policy</a
                      >
                      <br />
                      <a href="https://education.jacinthpaul.com/terms-and-conditions/"
                        >Terms & Conditions</a
                      >
                      <br />
                      <a
                        href="https://education.jacinthpaul.com/cancellation-and-refund-policy/"
                        >Cancellation & Refund Policy</a
                      >
                    </div>
                </div>
            </body>
            </html>
            `,
            TextPart: `Dear {{name}},

            Welcome to Jacinth Paul Academy! We're excited to have you on board as you embark on your path to becoming a future leader in engineering.
            
            Here’s what you can look forward to:
            - *Tailored Job Updates:* Custom alerts that match your career goals.
            - *ATS-Friendly Resume Builder:* Easily create standout resumes.
            - *Exclusive Events:* Access to hackathons, contests, and meet-ups.
            - *New Skills Development Section:* Dive into courses, trainings, workshops, and our interactive coding playground.
            
            Start exploring now: [Visit Your Dashboard]({{dashboard}})
            
            Need help or have questions? Contact us anytime at [Support Email]({{support}}).
            
            Best regards,
            
            The Jacinth Paul Academy Team`,
        },
    };

    try {
        const updateParams = {
          Template: template.Template,
        };
    
        const response = await client.send(new UpdateTemplateCommand(updateParams));
        console.log("Template updated successfully:", response);
      } catch (error) {
        console.error("Error updating template:", error);
      }
}

createTemplate();


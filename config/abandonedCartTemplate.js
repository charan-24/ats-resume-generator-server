const {
  SESClient,
  UpdateTemplateCommand,
  CreateTemplateCommand,
} = require("@aws-sdk/client-ses");
require("dotenv").config();
const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;

const client = new SESClient({
  region: regionName,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretKey,
  },
});

const createTemplate = async () => {
  const template = {
    Template: {
      TemplateName: "AbandonedCartMailTemplate",
      SubjectPart: "Complete Your Registration !",
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
                  <img src="https://drive.google.com/uc?export=view&id=1fv0kB3xoPo4dEcuOvPpehh4znmezX3__
                  " width="30" height="30" alt="Company Logo">
                  <h2>Jacinth Paul Academy</h2>
                </div>
              </div>
              <div class="mail-content">
              <p>Hi {{name}},</p>
              <p>We noticed that you were just a step away from completing your registration at Jacinth Paul Academy but didn't quite finish. Sometimes technology can get a bit tricky, and it looks like there might have been an issue during the payment process. No worries, we're here to help you get across the finish line!</p>
              <p>Complete Your Registration</p>
              <a href="{{link}}">{{link}}</a>
              <p>By completing your registration, you gain full access to our AI-powered career portal designed to streamline your job search and match you with the perfect engineering career opportunities. Here’s what’s waiting for you:</p>
              <ul>
                  <li>AI-Powered Resume Builder: Create resumes that stand out and beat the ATS.</li>
                  <li>Tailored Job Recommendations: Discover jobs that match your skills and interests.</li>
                  <li>Exclusive Events: Access to hackathons, coding contests, and networking events.</li>
              </ul>
              <p>We understand that small hiccups happen, and we appreciate your patience and interest in joining our community of future innovators. To ensure a smooth completion of your registration, please feel free to reach out to us if you encounter any further issues.</p>
              <p>Thank you for choosing Jacinth Paul Academy — your gateway to an exciting career future!</p>
              <br>
              <p>Warm Regards,<br>The Jacinth Paul Academy Team</p>
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
      TextPart: `Hi {{name}},

      We noticed that you were just a step away from completing your registration at Jacinth Paul Academy but didn't quite finish. Sometimes technology can get a bit tricky, and it looks like there might have been an issue during the payment process. No worries, we're here to help you get across the finish line!
      Complete Your Registration
    {{link}}
    By completing your registration, you gain full access to our AI-powered career portal designed to streamline your job search and match you with the perfect engineering career opportunities. Here’s what’s waiting for you:
- AI-Powered Resume Builder: Create resumes that stand out and beat the ATS.
- Tailored Job Recommendations: Discover jobs that match your skills and interests.
- Exclusive Events: Access to hackathons, coding contests, and networking events.
We understand that small hiccups happen, and we appreciate your patience and interest in joining our community of future innovators. To ensure a smooth completion of your registration, please feel free to reach out to us if you encounter any further issues.
Thank you for choosing Jacinth Paul Academy — your gateway to an exciting career future!
Warm Regards,
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
};

createTemplate();

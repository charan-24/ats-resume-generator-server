const {
  SESClient,
  CreateTemplateCommand,
  UpdateTemplateCommand,
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

const updateTemplate = async () => {
  const template = {
    Template: {
      TemplateName: "JobConfirmationTemplate",
      SubjectPart: "Follow-Up: Your Job Application Status",
      HtmlPart: ` <html>
      <head>
      <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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

      .header,
      .footer {
        background: linear-gradient(171.45deg, #00b3b4 18.9%, #064e9b 100.71%);
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

      .mail-content a {
        color: #ffffff;
        text-decoration: none;
      }
      .buttondiv {
        text-align: center;
      }
      .download-button {
        display: inline-block;
        padding-top: 5px;
        padding-right: 10px;
        padding-bottom: 5px;
        padding-left: 10px;
        margin: 5px;
        border-radius: 5px;
        background-color: rgb(55, 175, 212);
        color: #ffffff;
        text-decoration: none;
        font-weight: 500;
        text-align: center;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease-in-out;
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
            <img
              src="https://drive.google.com/uc?id=1-VFOZGTOE-omRc0KXKEPNvFGGKH0HLeG"
              width="30"
              height="30"
              alt="Company Logo"
            />
            <h2>Jacinth Paul Academy</h2>
          </div>
        </div>
        <div class="mail-content">
          <p>Dear {{name}},</p>
          <p>
            We wanted to follow up on your recent job application to
            Jacinth Paul Academy. Could you kindly update us on whether you've secured
            the position?
          </p>
          <br />
          <div class="buttondiv">
            <a href="{{yesLink}}" class="download-button">Yes</a>
            <a href="{{noLink}}" class="download-button">No</a>
          </div>
          <br />
          <p>Best Wishes,<br />The Jacinth Paul Academy Team</p>
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

                We wanted to follow up on your recent job application to Jacinth Paul Academy. Could you kindly update us on whether you've secured the position?
                {{yesLink}} {{noLink}}
                Best Regards,
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

updateTemplate();

require('dotenv').config();

const { SESClient, UpdateTemplateCommand, CreateTemplateCommand } = require("@aws-sdk/client-ses"); // CommonJS import
const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;

// console.log("hello"+regionName);

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
      TemplateName: "ResetPasswordTemplate", // required
      SubjectPart: "Reset Link",
      HtmlPart: `<html>
      <head>
      
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
                <div class="buttondiv">
                    <p><a href="{{resetLink}}" class="download-button">Reset password Now</a> Link expires after 1 hour</p>
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
      TextPart: `Hi {{name}},

                    {{resetLink}} Link expires after 1 hour
                    
                    Best Wishes,
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

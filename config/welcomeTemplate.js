const { SESClient, CreateTemplateCommand } = require("@aws-sdk/client-ses"); // CommonJS import
require('dotenv').config();
const accessKeyId = process.env.AWS_ACCESS_KEYID;  
const secretKey = process.env.AWS_SECRET_KEY;  
const regionName = process.env.S3_REGION;

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
            SubjectPart: `Welcome to Jacinth Paul Academy, {{name}}!`,
            HtmlPart: ` <p>Dear {{name}}, </p>
                        <p>Welcome to Jacinth Paul Academy! We're thrilled to have you join our community of future engineering leaders.</p>
                        <p>Get ready to explore:</p>
                        <ul>
                        <li>Tailored Job Updates</li>
                        <li>ATS-Friendly Resume Building</li>
                        <li>Exclusive Events Access</li>
                        </ul>
                        <p>To get started, visit your dashboard: <a>{{dashboard}}</a></p>
                        <p>If you have any questions or need guidance, our support team is here for you at {{support}}.</p>
                        <p>Best, <br>The Jacinth Paul Academy Team</p>`,
            TextPart: `Dear {{name}},

                        Welcome to Jacinth Paul Academy! We're thrilled to have you join our community of future engineering leaders.
                        
                        Get ready to explore:
                        
                        Tailored Job Updates
                        ATS-Friendly Resume Building
                        Exclusive Events Access
                        To get started, visit your dashboard: {{dashboard}}
                        
                        If you have any questions or need guidance, our support team is here for you at {{support}}.
                        
                        Best,
                        The Jacinth Paul Academy Team`
        },
    };

    const createTemplatecmd = new CreateTemplateCommand(template);

    const res = await client.send(createTemplatecmd)
    console.log(res);
}

createTemplate();


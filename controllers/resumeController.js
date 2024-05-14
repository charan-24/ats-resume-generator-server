require("dotenv").config();
const asyncHandler = require("express-async-handler");
const OpenAI = require("openai");
const db = require("../database/database");
const PDFDocument = require("pdfkit");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Upload } = require("@aws-sdk/lib-storage");
const crypto = require("crypto");
const axios = require("axios");
const SERVER = process.env.SERVER;

const accessKeyId = process.env.AWS_ACCESS_KEYID;
const secretKey = process.env.AWS_SECRET_KEY;
const regionName = process.env.S3_REGION;
const bucketName = process.env.S3_BUCKET;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});

const generateResume = asyncHandler(async (req, res) => {
  let resumereq = req.body;
  let userId = resumereq.user_id;

  console.log(resumereq);
  resumereq.projects = JSON.parse(resumereq.projects);
  resumereq.certificates = JSON.parse(resumereq.certificates);
  console.log(resumereq);
  const resumename = resumereq.resumename;
  if (!resumereq || !Object.keys(resumereq).length) {
    return res.status(401).json({ message: "empty data received" });
  }

  const [maildata] = await db.query(`select firstname,email from userdetails where user_id = ?`,[userId])
                          .catch(err=>{
                            return res.status(400).json(err.sqlMessage);
                          });
  maildata[0].email = "saicharan@jacinthpaul.com"

  await axios.post(`${SERVER}/portal/sendResumeRequestMail`,{"name":maildata[0].firstname,"email":maildata[0].email})
          .then(res=>{
              console.log(res.data);
          })
          .catch(err=>{
              console.log(err);
          }); 

  const [jobrole] = await db.query(
      `select jobrole_name, jobrole_description from jobroles where jobrole_id`,
      [resumereq.jobroleid]
    )
    .catch((err) => {
      return res.status(400).json({ message: err.sqlMessage });
    });

  //collecting personal details
  const userdetails = [];
  const [personalresult] = await db.query(`select * from userdetails where user_id = ?`, [
      parseInt(resumereq.user_id),
    ])
    .catch((err) => {
      return res.status(400).json({ message: err.sqlMessage });
    });
  userdetails.push(personalresult[0]);
  console.log(userdetails);

  // collecting education
  const education = [];
  const [eduresult] = await db.query(`select * from educationaldetails where user_id = ?`, [
      parseInt(resumereq.user_id),
    ])
    .catch((err) => {
      return res.status(400).json({ message: err.sqlMessage });
    });
  education.push(eduresult[0]);
  console.log(education);

  // collecting workexp
  let workexp = [];
  const workresult = await db.query(`select * from workexperience where user_id = ?`, [
      parseInt(resumereq.user_id),
    ])
    .catch((err) => {
      return res.status(400).json({ message: err.sqlMessage });
    });
  // console.log(workresult);
  workexp = workresult[0];
  console.log(workexp);

  // // colllecting projects
  const projects = [];
  for (let i = 0; i < resumereq?.projects?.length; i++) {
    const projid = resumereq.projects[i];
    const [projresult] = await db.query(`select * from userprojects where project_id = ?`, [
        parseInt(projid),
      ])
      .catch((err) => {
        return res.status(400).json({ message: err.sqlMessage });
      });
    projects.push(projresult[0]);
  }
  console.log(projects);

  // // collecting skills
  const skills = [resumereq.skills];
  console.log(skills);

  // //collecting certificates
  // console.log(JSON.parse(resumereq?.certificates));
  let certificates = [];
  if (resumereq.certificates) {
    const certresult = await db.query(`select * from usercertificates where user_id = ?`, [
        parseInt(resumereq.user_id),
      ])
      .catch((err) => {
        return res.status(400).json({ message: err.sqlMessage });
      });
    // console.log(certresult[0]);
    certificates = certresult[0];
  }
  console.log(certificates);

  // //collecting hobbies
  const hobbies = [];
  if (resumereq.hobbies) {
    hobbies.push(resumereq.hobbies);
  }
  console.log(hobbies);

  const systemcontent = `You are an professional, ATS friendly resume generator. Generate a professional, ATS-friendly resume for ${jobrole[0].jobrole_name} position, and try to tailor the resume with the job description which is ${jobrole[0].jobrole_description} and Please provide a static response without dynamic placeholders and just give me the content of the summary as string do not include the key as in key-value pairs in the response in one paragraph with out any side headings`;
  const workResponses = [];
  for (let i = 0; i < workexp?.length; i++) {
    const result = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${systemcontent}` },
        {
          role: "user",
          content: `Please generate a description of the work experience at ${workexp[i].company_name} where the user worked as a ${workexp[i].job_title}.Please provide a static response without dynamic placeholders and just respond with the content of the summary as string`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 75,
    });
    // console.log(result);
    workResponses.push(result?.choices[0]?.message?.content);
    workexp[i].job_description = result?.choices[0].message?.content;
  }
  console.log(workexp);

  const projectResponses = [];
  for (let i = 0; i < projects?.length; i++) {
    const result = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${systemcontent}` },
        {
          role: "user",
          content: `Please generate a description of the ${projects[i].title} and regenrate the description which is ${projects[i].description}. Please provide a static response without dynamic placeholders and just respond with the content of the summary as string`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 75,
    });
    // console.log(result);
    projectResponses.push(result?.choices[0]?.message?.content);
    projects[i].description = result?.choices[0]?.message?.content;
  }
  console.log(projects);
  const resp = await axios
    .post(
      SERVER+"/resume/jsonToPdf/",
      {
        userid: resumereq.user_id,
        firstname: maildata[0].firstname,
        email: maildata[0].email,
        resumename,
        userdetails,
        workexp,
        projects,
        education,
        skills,
        certificates,
        hobbies,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
  return res.sendStatus(200);
});

const jsonToPdf = asyncHandler(async (req, res) => {
  const jsondata = req.body;
  const user_id = jsondata.userid;
  const firstname = jsondata.firstname;
  const email = jsondata.email;
  console.log(jsondata);
  const resumeContent = {
    Name:
      jsondata?.userdetails[0].firstname +
      " " +
      jsondata?.userdetails[0].lastname,
    Email: jsondata?.userdetails[0].email,
    Mobile: jsondata?.userdetails[0].phone_number,
    "Skills Summary": jsondata.skills,
    Education: [],
    Experience: [],
    Projects: [],
    // Extracurriculars: [
    //   "Committee member of Turing Hut, the Programming Club at VNR VJIET. Developed visually appealing posters and created informative documents to enhance communication and promotion of club events. Organized and facilitated coding contests, workshops, created posters and made documents and peer-to-peer teaching sessions as part of the club’s initiatives.",
    //   "Attended a 10 days Bootcamp conducted by the WE program. It covered self-learning tools, modern programming languages and corporate skills.",
    // ],
    // "Honors and Awards": [
    //   "Awarded a scholarship for getting selected into the Women Engineers Program offered by TalentSprint, supported by Google which focuses on technical and corporate skills training. I am one of the top 1% of scholars selected from over 27,000+ eligible applicants across the country for this highly selective program.",
    //   "Achieved third place in the Wiki Women Hackathon hosted at IIIT Hyderabad, showcasing strong collaborative skills, tech",
    // ],
  };
  if (jsondata?.userdetails[0]?.linkedinurl) {
    resumeContent["Linkedin"] = jsondata?.userdetails[0].linkedinurl;
  }
  if (jsondata?.userdetails[0]?.github) {
    resumeContent["Github"] = jsondata?.userdetails[0].github;
  }
  jsondata.education.map((edu) => {
    resumeContent?.Education?.push({
      name: edu.college_name,
      Branch: edu.specialization,
      Year: edu.year_of_grad.substr(0, 4),
      CGPA: edu.cgpa_or_percentage,
    });
  });

  jsondata.workexp.map((work) => {
    resumeContent?.Experience?.push({
      name: work.company_name,
      Duration:
        work.start_date.substr(0, 10) + " - " + work.end_date.substr(0, 10),
      Role: work.job_title,
      Description: work.job_description,
    });
  });
  jsondata.projects.map((project) => {
    resumeContent?.Projects?.push({
      name: project.title,
      description: project.description,
    });
  });
  const doc = new PDFDocument({
    margins: {
      top: 35,
      bottom: 35,
      left: 35,
      right: 35,
    },
  });

  // Styles for different sections
  const styles = {
    heading: {
      fontSize: 14,
      font: "Times-Bold",
      marginBottom: 5,
    },
    content: {
      fontSize: 11,
      font: "Times-Roman",
      boldfont: "Times-Bold",
      marginBottom: 5,
      marginTop: 5,
    },
    bulletPoint: {
      fontSize: 11,
      font: "Times-Roman",
      marginRight: 5,
    },
  };

  function generateHeading(text) {
    doc
      .moveDown(1)
      .fontSize(styles.heading.fontSize)
      .font(styles.heading.font)
      .text(text);
  }

  function generateLine() {
    const marginX = 30;
    const lineWidth = doc.page.width - 2 * marginX;
    const startX = marginX;
    const endX = doc.page.width - marginX;

    doc
      .moveDown(0.25)
      .lineWidth(1)
      .strokeColor("black")
      .moveTo(startX, doc.y)
      .lineTo(endX, doc.y)
      .stroke()
      .moveDown(0.5);
  }

  function generateInfo(key, value) {
    doc
      .fontSize(styles.content.fontSize)
      .font(styles.content.font)
      .text(`${key}: ${value}`)
      .moveDown(0.2);
  }

  function addNewLine(space) {
    doc.moveDown(space).text("", { align: "left" });
  }

  function generateBulletPoint() {
    doc
      .fontSize(styles.bulletPoint.fontSize)
      .font(styles.bulletPoint.font)
      .text(`\u2022 `, {
        continued: true,
        marginRight: styles.bulletPoint.marginRight,
      });
  }

  function generateContent(text, isBold = false) {
    if (isBold) {
      doc
        .fontSize(styles.content.fontSize)
        .font(styles.content.boldfont)
        .text(` ${text}`, { continued: true });
    } else {
      doc
        .fontSize(styles.content.fontSize)
        .font(styles.content.font)
        .text(` ${text}`, { continued: true });
    }
  }

  function generateRightAlignedContent(text) {
    doc
      .fontSize(styles.content.fontSize)
      .font(styles.content.font)
      .text(text, { align: "right" });
  }

  function resetAlignment() {
    doc.text("", { align: "left" });
  }

  doc.pipe(require("fs").createWriteStream("resume.pdf"));

  function capitalizeEachWord(str) {
    return str.toLowerCase().replace(/(^|\s)\S/g, function (letter) {
      return letter.toUpperCase();
    });
  }

  function capitalizeFirstLetterOfSentence(str) {
    // Capitalize the first letter of the string
    str = str.charAt(0).toUpperCase() + str.slice(1);

    // Find the positions of all '.' (periods) in the string
    let positions = [];
    let pos = str.indexOf(".");
    while (pos !== -1) {
      positions.push(pos);
      pos = str.indexOf(".", pos + 1);
    }

    // Capitalize the letter after each period
    for (let i = 0; i < positions.length; i++) {
      let index = positions[i] + 1; // Default index of the letter after the period
      // Check if there is a space after the period
      if (index < str.length && str.charAt(index) === " ") {
        index++; // Move to the letter after the space
      }
      // Capitalize the letter
      if (index < str.length) {
        str =
          str.slice(0, index) +
          str.charAt(index).toUpperCase() +
          str.slice(index + 1);
      }
    }

    return str;
  }

  // Add Name
  doc.fontSize(18).font("Times-Bold").text(capitalizeEachWord(resumeContent.Name)).moveDown(0.5);

  // Add Contact Information
  generateInfo("Email", resumeContent.Email);
  if (resumeContent.Linkedin) {
    generateInfo("Linkedin", resumeContent.Linkedin);
  }
  if (resumeContent.Github) {
    generateInfo("Github", resumeContent.Github);
  }
  generateInfo("Mobile", resumeContent.Mobile);

  // Add Skills Summary Section
  generateHeading("Skills Summary");
  generateLine();
  resumeContent["Skills Summary"].forEach((skill) => {
    generateBulletPoint();
    generateContent(skill);
    addNewLine(1.5);
  });

  // Add Education Section
  generateHeading("Education");
  generateLine();
  resumeContent.Education.forEach((edu) => {
    generateBulletPoint();
    generateContent(capitalizeEachWord(edu.name), true);
    generateRightAlignedContent(edu.Year);
    resetAlignment();
    if (edu.Branch) {
      generateContent(`Branch: ${edu.Branch}`);
    }
    if (edu.Subjects) {
      generateContent(`Subjects: ${edu.Subjects}`);
    }
    if (edu.CGPA) {
      generateContent(`CGPA: ${edu.CGPA}`);
    }
    if (edu.Percentage) {
      generateContent(`Percentage: ${edu.Percentage}`);
    }
    addNewLine(1.5);
  });

  // Add Experience Section
  generateHeading("Experience");
  generateLine();
  resumeContent.Experience.forEach((exp) => {
    generateBulletPoint();
    generateContent(capitalizeEachWord(exp.name), true);
    generateRightAlignedContent(exp.Duration);
    resetAlignment;
    generateContent(exp.Role);
    generateContent(capitalizeFirstLetterOfSentence(exp.Description));
    addNewLine(1.5);
  });

  // Add Projects Section
  generateHeading("Projects");
  generateLine();
  resumeContent.Projects.forEach((project) => {
    generateBulletPoint();
    generateContent(capitalizeEachWord(project.name), true);
    addNewLine(1);
    generateContent(capitalizeFirstLetterOfSentence(project.description));
    addNewLine(1.5);
  });

  // Add Extracurriculars Section
  // generateHeading("Extracurriculars");
  // generateLine();
  // resumeContent.Extracurriculars.forEach((activity) => {
  //   generateBulletPoint();
  //   generateContent(capitalizeFirstLetterOfSentence(activity));
  //   addNewLine(1.5);
  // });

  // Add Honors and Awards Section
  // generateHeading("Honors and Awards");
  // generateLine();
  // resumeContent["Honors and Awards"].forEach((award) => {
  //   generateBulletPoint();
  //   generateContent(capitalizeFirstLetterOfSentence(award));
  //   addNewLine(1.5);
  // });

  addNewLine(1);
  addNewLine(1);
  addNewLine(1);

  // Add Declaration
  doc
    .fontSize(8)
    .font("Times-Roman")
    .text(
      "*I hereby declare that the information given is true to the best of my knowledge"
    )
    .moveDown(0.5);

  const buffer = [];
  doc.on("data", function (chunk) {
    buffer.push(chunk);
  });
  
  doc.on("end", async function () {
    const pdfBuffer = Buffer.concat(buffer);
    // Now you have the PDF buffer, you can do further processing, save it to a file, or send it over the network.
    // For example, you can save it to a file like this:

    const s3 = new S3Client({
      region: regionName,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretKey,
      },
    });

    const fileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
    const filePath = `userResumes/${fileName()}`;

    const params = {
      Bucket: bucketName,
      Key: filePath,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    };
    console.log(pdfBuffer);

    try {
      const parallelUploads3 = new Upload({
        client: s3,
        queueSize: 4, // optional concurrency configuration
        leavePartsOnError: false, // optional manually handle dropped parts
        params: params,
      });

      parallelUploads3.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });
      await parallelUploads3.done();
      console.log("PDF saved successfully.");
    } catch (e) {
      console.log(e);
    }

    // await s3.send(new PutObjectCommand(params));
    await db
      .query(`insert into userresumes set ?`, {
        user_id: user_id,
        resumename: jsondata?.resumename,
        resumeawspath: filePath,
      })
      .catch((err) => {
        return res.status(400).json({ message: err.sqlMessage });
      });

    await db.query(`update useraccounts set resumesused = resumesused + 1 where user_id = ?`,[user_id])
            .catch(err=>{
              return res.status(400).json(err.sqlMessage);
      }); 
    console.log("db updated");

    await axios.post(`${SERVER}/portal/sendResumeDownloadMail`,{"name":firstname,"email":email})
          .then(res=>{
              console.log(res.data);
          })
          .catch(err=>{
              console.log(err);
          });

  });

  doc.end();
  console.log("PDF generated successfully!");
  return res.status(200).json({ message: "PDF generated successfully!" });
});

const getResume = asyncHandler(async (req, res) => {
  const { resumeid } = req.params;
  console.log(resumeid);
  if (!resumeid) {
    return res.status(400).json("empty data");
  }

  const [resumepath] = await db
    .query(`select resumeawspath from userresumes where resume_id = ?`, [
      resumeid,
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
    Key: resumepath[0].resumeawspath,
  };
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return res.send(url);
});

module.exports = {
  generateResume,
  jsonToPdf,
  getResume,
};

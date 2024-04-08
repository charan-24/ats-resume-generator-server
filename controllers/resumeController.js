require('dotenv').config();
const asyncHandler = require('express-async-handler');
const OpenAI = require('openai');
const db = require('../database/database');
const {jsPDF} = require('jspdf');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_APIKEY
});

const generateResume = asyncHandler(async (req, res) => {
    const resumereq = req.body;
    if (!resumereq || !Object.keys(resumereq).length) {
        return res.status(401).json({ message: "empty data received" });
    }

    const [jobrole] = await db.query(`select jobrole_name, jobrole_description from jobroles where jobrole_id`,[resumereq.jobroleid])
                            .catch(err=>{
                                return res.status(400).json({message:err.sqlMessage});
                            });
    

    // collecting education
    const education = [];
    const [eduresult] = await db.query(`select * from educationalDetails where user_id = ?`, [parseInt(resumereq.user_id)])
        .catch(err => {
            return res.status(400).json({ message: err.sqlMessage });
        });
    education.push(eduresult[0]);
    console.log(education);

    // collecting workexp
    let workexp = [];
    const workresult = await db.query(`select * from workexperience where user_id = ?`, [parseInt(resumereq.user_id)])
        .catch(err => {
            return res.status(400).json({ message: err.sqlMessage });
        });
    // console.log(workresult);
    workexp = workresult[0];
    console.log(workexp);

    // colllecting projecs
    const projects = [];
    for (let i = 0; i < resumereq?.projects?.length; i++) {
        const projid = resumereq.projects[i];
        const [projresult] = await db.query(`select * from userprojects where project_id = ?`, [parseInt(projid)])
            .catch(err => {
                return res.status(400).json({ message: err.sqlMessage });
            });
        projects.push(projresult[0]);
    }
    console.log(projects);

    // collecting skills
    const skills = [resumereq.skills]
    console.log(skills);

    //collecting certificates
    let certificates = [];
    if (resumereq.certificates) {
        const certresult = await db.query(`select * from usercertificates where user_id = ?`, [parseInt(resumereq.user_id)])
            .catch(err => {
                return res.status(400).json({ message: err.sqlMessage });
            });
        // console.log(certresult[0]);
        certificates = certresult[0];
    }
    console.log(certificates);

    //collecting hobbies
    const hobbies = [];
    if (resumereq.hobbies) {
        hobbies.push(resumereq.hobbies);
    }
    console.log(hobbies);

    const systemcontent = `You are an professional, ATS friendly resume generator. Generate a professional, ATS-friendly resume for ${jobrole[0].jobrole_name} position, and try to tailor the resume with the job description which is ${jobrole[0].jobrole_description} and Please provide a static response without dynamic placeholders and just give me the content of the summary as string do not include the key as in key-value pairs in the response in one paragraph with out any side headings`
    const workResponses = [];
    for(let i=0;i<workexp?.length;i++){
        const result = await openai.chat.completions.create({
            messages: [{ "role": "system", "content": `${systemcontent}` },
                    {"role":"user","content":`Please generate a description of the work experience at ${workexp[i].company_name} where the user worked as a ${workexp[i].job_title}.Please provide a static response without dynamic placeholders and just respond with the content of the summary as string`}
                ],
            model:"gpt-3.5-turbo",
            max_tokens:75
        });
        // console.log(result);
        workResponses.push(result?.choices[0]?.message?.content);
        workexp[i].job_description = result?.choices[0].message?.content;
    }
    console.log(workResponses);

    const projectResponses = [];
    for(let i=0;i<projects?.length;i++){
        const result = await openai.chat.completions.create({
            messages: [{ "role": "system", "content": `${systemcontent}` },
                    {"role":"user","content":`Please generate a description of the ${projects[i].title} and regenrate the description which is ${projects[i].description}. Please provide a static response without dynamic placeholders and just respond with the content of the summary as string`}
                ],
            model:"gpt-3.5-turbo",
            max_tokens:75
        });
        // console.log(result);
        projectResponses.push(result?.choices[0]?.message?.content);
        projects[i].description = result?.choices[0]?.message?.content;
    }
    console.log(projectResponses);

    const summary = await openai.chat.completions.create({
            messages: [{ "role": "system", "content": `To generate a summary for the user, you can utilize the data provided by the user, such as their work experiences, projects, and skills` },
                        {"role":"user","content":`Generate a summary for me , highlighting the key skills, experiences, and accomplishments. Additionally, consider the involvement of me in projects such as Focus on presenting as a skilled professional with expertise in ${skills}. Please provide a static response without dynamic placeholders and just respond with the content of the summary as string`}
                    ],
                model:"gpt-3.5-turbo",
                max_tokens:75
    });
    const usersummary = summary.choices[0].message.content;
    return res.status(200).json({usersummary,workexp,projects,education,skills,certificates,hobbies});
    // return res.status(200).json({projectResponses})
    // return res.status(200).json({message:"testing data"})
});

const jsonToPdf = asyncHandler(async(req,res)=>{
    const doc = new jsPDF();

    doc.text('Hello world',10,10);
    doc.text('Java world',20,20);
    doc.text('Nodejs world',30,30); 
    let pdfBuffer = doc.output('arraybuffer');

    pdfBuffer = Buffer.from(new Uint8Array(pdfBuffer));
    return res.status(200).json(pdfBuffer);
});


 
module.exports = {
    generateResume,
    jsonToPdf,
}
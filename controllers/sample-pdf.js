const PDFDocument = require("pdfkit");

const resumeContent = {
  Name: "Barla Varsha Reddy",
  Email: "varshareddybarla2003@gmail.com",
  Linkedin: "https://www.linkedin.com/in/varsha-reddy-barla-654156243/",
  Mobile: "+91-9063262770",
  Github: "https://github.com/varshareddy03",
  "Skills Summary": [
    "Languages and Technical Skills: Python, C ++, C language, DBMS",
    "Version Control: Git and GitHub",
    "Web Technologies: HTML, CSS, Bootstrap, JavaScript, MERN stack",
    "Soft Skills: Leadership, Teamwork, Event Management, Time Management",
  ],
  Education: [
    {
      name: "VNR Vignana Jyothi Institute of Engineering and Technology Hyderabad, India",
      Branch: "Bachelor of Technology - Computer Science and Engineering",
      Year: "2021 - 2025",
      CGPA: "9.05",
    },
  ],
  Experience: [
    {
      name: "Unplatforms Technologies Private Limited",
      Duration: " May 2023 - Nov 2023",
      Role: "Software Intern Trainee",
      Description:
        "Designed web applications for a dynamic startup company.Contributed to the development of Time.Dev web application which is in the final stages of launch.Gained expertise in a range of cutting-edge technologies, including TailwindCSS, NestJS, Typescript, Redux, and MySQL.",
    },
  ],
  Projects: [
    {
      name: "Pharmacy Management System",
      description:
        "A project which organizes and maintains the medicines within the pharmacies, prints the receipt, reducing billing errors and improving efficiency. It is developed using the concept of classes, objects, files in C++.",
    },
    {
      name: "Wikipedia Text Formatter",
      description:
        "A web application designed to elevate user experience by offering enhanced text formatting options for Wikipedia content. Leveraging React, Tailwind CSS, and JavaScript, we implemented features including text customization, speech synthesis, download functionality, and language translation.",
    },
    {
      name: "Restaurant Web Application",
      description:
        "Developed a web application for a hypothetical restaurant using basic HTML, CSS and Bootstrap (only Responsive Web Design). This project is currently limited to the front end and would further be extended to back end development.",
    },
  ],
  Extracurriculars: [
    "Committee member of Turing Hut, the Programming Club at VNR VJIET. Developed visually appealing posters and created informative documents to enhance communication and promotion of club events. Organized and facilitated coding contests, workshops, created posters and made documents and peer-to-peer teaching sessions as part of the club’s initiatives.",
    "Attended a 10 days Bootcamp conducted by the WE program. It covered self-learning tools, modern programming languages and corporate skills.",
  ],
  "Honors and Awards": [
    "Awarded a scholarship for getting selected into the Women Engineers Program offered by TalentSprint, supported by Google which focuses on technical and corporate skills training. I am one of the top 1% of scholars selected from over 27,000+ eligible applicants across the country for this highly selective program.",
    "Achieved third place in the Wiki Women Hackathon hosted at IIIT Hyderabad, showcasing strong collaborative skills, tech",
  ],
};

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
    boldfont:"Times-Bold",
    marginBottom: 5,
    marginTop: 5
  },
  bulletPoint: {
    fontSize: 11,
    font: "Times-Roman",
    marginRight: 5,
  }
};

function generateHeading(text) {
  doc.moveDown(1).fontSize(styles.heading.fontSize).font(styles.heading.font).text(text);
}

function generateLine() {
  const marginX = 30; 
  const lineWidth = doc.page.width - 2 * marginX; 
  const startX = marginX;
  const endX = doc.page.width - marginX;

  doc.moveDown(0.25)
     .lineWidth(1)
     .strokeColor("black")
     .moveTo(startX, doc.y)
     .lineTo(endX, doc.y)
     .stroke()
     .moveDown(0.5);
}

function generateInfo(key, value) {
  doc.fontSize(styles.content.fontSize).font(styles.content.font).text(`${key}: ${value}`).moveDown(0.2);
}

function addNewLine(space) {
  doc.moveDown(space).text("", { align: "left" });
}

function generateBulletPoint() {
  doc.fontSize(styles.bulletPoint.fontSize).font(styles.bulletPoint.font).text(`\u2022 `, { continued: true, marginRight: styles.bulletPoint.marginRight });
}

function generateContent(text, isBold = false) {
  if(isBold)
  {
    doc.fontSize(styles.content.fontSize).font(styles.content.boldfont).text(` ${text}`, { continued: true });
  }
  else{
    doc.fontSize(styles.content.fontSize).font(styles.content.font).text(` ${text}`, { continued: true });
  }
  
}

function generateRightAlignedContent(text) {
  doc.fontSize(styles.content.fontSize).font(styles.content.font).text(text,{ align: "right" });
}

function resetAlignment() {
  doc.text("", { align: "left" });
}

doc.pipe(require("fs").createWriteStream("resume.pdf"));

// Add Name
doc.fontSize(18).font("Times-Bold").text(resumeContent.Name).moveDown(0.5);

// Add Contact Information
generateInfo("Email", resumeContent.Email);
generateInfo("Linkedin", resumeContent.Linkedin);
generateInfo("Github", resumeContent.Github);
generateInfo("Mobile", resumeContent.Mobile);

// Add Skills Summary Section
generateHeading("Skills Summary");
generateLine();
resumeContent["Skills Summary"].forEach((skill) => {
  generateBulletPoint()
  generateContent(skill);
  addNewLine(1.5)
});

// Add Education Section
generateHeading("Education");
generateLine();
resumeContent.Education.forEach((edu) => {
  generateBulletPoint()
  generateContent(edu.name, true);
  generateRightAlignedContent(edu.Year);
  resetAlignment()
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
  addNewLine(1.5)
});

// Add Experience Section
generateHeading("Experience");
generateLine();
resumeContent.Experience.forEach((exp) => {
  generateBulletPoint()
  generateContent(exp.name, true);
  generateRightAlignedContent(exp.Duration);
  resetAlignment
  generateContent(exp.Role);
  generateContent(exp.Description);
  addNewLine(1.5)
});

// Add Projects Section
generateHeading("Projects");
generateLine();
resumeContent.Projects.forEach((project) => {
  generateBulletPoint()
  generateContent(project.name, true);
  addNewLine(1)
  generateContent(project.description);
  addNewLine(1.5)
});

// Add Extracurriculars Section
generateHeading("Extracurriculars");
generateLine();
resumeContent.Extracurriculars.forEach((activity) => {
  generateBulletPoint()
  generateContent(activity);
  addNewLine(1.5)
});

// Add Honors and Awards Section
generateHeading("Honors and Awards");
generateLine();
resumeContent["Honors and Awards"].forEach((award) => {
  generateBulletPoint()
  generateContent(award);
  addNewLine(1.5)
});

addNewLine(1)

// Add Declaration
doc
  .fontSize(8)
  .font("Times-Roman")
  .text(
    "*I hereby declare that the information given is true to the best of my knowledge"
  )
  .moveDown(0.5);

doc.end();
console.log("PDF generated successfully!");

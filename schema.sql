create table userAccounts(
    user_id int primary key auto_increment,
    username varchar(255) not null,
    password varchar(255) not null,
    email varchar(255) not null,
    registered_date timestamp default current_timestamp,
    last_login timestamp default current_timestamp,
    role varchar(255) default 'user',
    isActive boolean default true,
    refreshToken varchar(255);
);

create table userDetails(
    user_id int primary key,
    username varchar(255) not null,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    email varchar(255) not null,
    email_org varchar(255) not null,
    phone_number varchar(255) not null,
    city varchar(255) not null,
    strength varchar(2550) not null,
    weakness varchar(2550) not null,
    linkedinurl varchar(255),
    foreign key(user_id) references userAccounts(user_id)
);

create table educationalDetails(
    education_id int primary key auto_increment,
    user_id int not null,
    username varchar(255) not null,
    qualification varchar(255) not null,
    specialization varchar(255) not null,
    college_name varchar(255) not null,
    year_of_grad date not null,
    cgpa_or_percentage float not null,
    college_rollno varchar(255),
    foreign key(user_id) references userAccounts(user_id)
);

create table workExperience(
    work_id int primary key auto_increment,
    user_id int not null,
    username varchar(255) not null,
    company_name varchar(255) not null,
    job_title varchar(255) not null,
    start_date date not null,
    end_date date not null,
    job_description varchar(5000) not null,
    technologies_used varchar(255) not null,
    foreign key(user_id) references userAccounts(user_id)
);

create table subscriptions(
    subscription_id int primary key,
    user_id int not null,
    plan varchar(255) not null,
    startdate date not null,
    enddate date not null,
    amount float not null,
    status varchar(255) not null,
    payment_id varchar(255) not null,
    order_id varchar(255) not null,
    razorpaysignature varchar(255) not null,
    foreign key(user_id) references userAccounts(user_id)
);

create table feedbacks(
    feedback_id int primary key auto_increment,
    user_id int not null,
    username varchar(255) not null,
    fullname varchar(255) not null,
    email varchar(255) not null,
    category varchar(255) not null,
    `subject` varchar(255) not null,
    `description` varchar(5000) not null,
    urgency varchar(255) not null,
    contact_method varchar(255) not null,
    issue_date timestamp default current_timestamp,
    status varchar(255) default 'open',
    foreign key(user_id) references userAccounts(user_id)
);

create table adminAccounts(
    admin_id int primary key auto_increment,
    username varchar(255) not null,
    password varchar(255) not null,
    email varchar(255) not null,
    registered_date timestamp default current_timestamp,
    last_login timestamp default current_timestamp,
    role varchar(255) default 'admin',
    isActive boolean default true,
    refreshToken varchar(255)
);

create table jobroles(
    jobrole_id int not null primary key auto_increment,
    jobrole_name varchar(255) not null,
    jobrole_description varchar(5000) not null
);

update jobroles set jobrole_description = "Identify target user groups and carry out interviews or other types of inquiry to help understand user needs. Ensure the creation and implementation of customized experiences for the digital user. Produce high-quality solutions through flow diagrams, graphic designs, storyboards and site maps. Provide guidance on the implementation of UX research techniques and testing activities to assess user behavior. Maintain a competitive edge against competitor products and industry trends. Perform tests on user interface elements such as CTAs, layouts, target links, landing pages and banners. Understand product specifications and user psychology and predict what might work for both. Diploma/ degree is MUST in design" where jobrole_id = 2;

create table jobslisted(
    job_id int primary key auto_increment,
    jobrole_id int not null,
    title varchar(255) not null,
    company varchar(255) not null,
    description varchar(5000) not null,
    location varchar(255) not null,
    job_type varchar(255) not null,
    experience varchar(255) not null,
    salary float,
    posted_date timestamp default current_timestamp,
    status varchar(255) default 'open',
    foreign key(jobrole_id) references jobroles(jobrole_id)
);

create table preferredjobroles(
    pref_id int not null primary key auto_increment,
    user_id int not null,
    jobrole_id int not null,
    foreign key(user_id) references userAccounts(user_id),
    foreign key(jobrole_id) references jobroles(jobrole_id)
);

create table jobapplications(
    job_applied_id int primary key auto_increment,
    job_id int not null,
    user_id int not null,
    username varchar(255) not null,
    foreign key(job_id) references jobslisted(job_id)
);

create table hackathons(
    hackathon_id int primary key auto_increment,
    title varchar(255) not null,
    `description` varchar(5000) not null,
    startdate date not null,
    enddate date not null,
    `location` varchar(255) not null,
    deadline date not null,
    eventurl varchar(255) not null,
    organizer varchar(255) not null,
    sponsors varchar(255) not null,
    prizes varchar(255) not null,
    eligibility varchar(255) not null,
    teamsize int not null,
    registrationfee float not null,
    techstack varchar(255) not null,
    judging varchar(255) not null,
    mentors boolean not null,
    resources varchar(255) not null,
    schedule varchar(255) not null,
    registrationlink varchar(255) not null,
    `status` varchar(255) default 'open',
    created_date timestamp default current_timestamp
);

create table hackathonwinners(
    hackwinner_id int primary key auto_increment,
    title varchar(255) not null,
    winnername varchar(255) not null,
    collegename varchar(255) not null,
    projectname varchar(255) not null,
    highlights varchar(255) not null,
);

create table codingcontests(
    contest_id int primary key auto_increment,
    title varchar(255) not null,
    `description` varchar(5000) not null,
    startdate date not null,
    enddate date not null,
    `location` varchar(255) not null,
    deadline date not null,
    eventurl varchar(255) not null,
    organizer varchar(255) not null,
    sponsors varchar(255) not null,
    prizes varchar(255) not null,
    eligibility varchar(255) not null,
    teamsize  varchar(255) not null,
    registrationfee varchar(255) not null,
    techstack varchar(255) not null,
    judging varchar(255) not null,
    mentors boolean not null,
    resources varchar(255) not null,
    schedule varchar(255) not null,
    registrationlink varchar(255) not null,
    `status` varchar(255) default 'open',
    created_date timestamp default current_timestamp
);

create table contestwinners(
    contestwinner_id int primary key auto_increment,
    title varchar(255) not null,
    winnername varchar(255) not null,
    collegename varchar(255) not null,
    highlights varchar(255) not null,
    created_date timestamp default current_timestamp
);

create table codingmeetups(
    meetup_id int primary key auto_increment,
    title varchar(255) not null,
    `description` varchar(5000) not null,
    startdate date not null,
    enddate date not null,
    `location` varchar(255) not null,
    deadline date not null,
    eventurl varchar(255) not null,
    organizer varchar(255) not null,
    sponsors varchar(255) not null,
    prizes varchar(255) not null,
    eligibility varchar(255) not null,
    teamsize  varchar(255) not null,
    registrationfee varchar(255) not null,
    techstack varchar(255) not null,
    judging varchar(255) not null,
    mentors boolean not null,
    resources varchar(255) not null,
    schedule varchar(255) not null,
    registrationlink varchar(255) not null,
    `status` varchar(255) default 'open',
    created_date timestamp default current_timestamp
);

create table meetupwinners(
    meetupwinner_id int primary key auto_increment,
    title varchar(255) not null,
    winnername varchar(255) not null,
    collegename varchar(255) not null,
    projectname varchar(255) not null,
    created_date timestamp default current_timestamp
);

create table userprojects(
    project_id int primary key auto_increment,
    user_id int not null,
    title varchar(255) not null,
    technologies varchar(255) not null,
    description varchar(5000) not null,
    projecturl varchar(255),
    roleinproject varchar(255) not null,
    skills varchar(255),
    startdate date,
    enddate date,
    foreign key(user_id) references userAccounts(user_id)
);

create table usercertificates(
    usercert_id int primary key auto_increment,
    user_id int not null,
    title varchar(255) not null,
    issuedby varchar(255) not null,
    issueddate date not null,
    certificateurl varchar(255),
    foreign key(user_id) references userAccounts(user_id)
);

create table userResumes(
    resume_id int primary key auto_increment,
    user_id int not null,
    resumeawspath varchar(255) not null,
    foreign key(user_id) references userAccounts(user_id)
);



ALTER TABLE jobslisted
ADD FOREIGN KEY(jobrole_id)
REFERENCES jobroles(jobrole_id);



SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE table userAccounts; 
SET FOREIGN_KEY_CHECKS = 1;

update adminaccounts set refreshToken = " " where admin_id = 1;
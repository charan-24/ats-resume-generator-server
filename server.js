require('dotenv').config();
const exp = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app=exp();
const cron = require('node-cron');
const axios  = require('axios');
const port = process.env.PORT || 5000;
console.log(port);
const SERVER = process.env.SERVER;

//middlewares
app.use(cors());
app.use(exp.json());
app.use(cookieParser());
app.use(exp.urlencoded({extended: false}));

//database connection
require('./database/database');

// require('./config/jobAlertTemplate');

//routes
app.use('/user',require('./routes/user'));
app.use('/admin',require('./routes/admin'));
app.use('/hr',require('./routes/hr'));
app.use('/tpo',require('./routes/tpo'));
app.use('/events',require('./routes/events'));
app.use('/resume',require('./routes/resume'));
app.use('/feedback',require('./routes/feedback'));
app.use('/payment',require('./routes/payment'));
app.use('/portal',require('./routes/portal'));
app.use('/pfp',require('./routes/pfp'));
app.use('/logout',require('./routes/logout'));
app.use('/skills',require('./routes/skills'));

cron.schedule('57 19 * * *', async () => {
    console.log(`cron satrted on ${SERVER}`)
    await axios.post(`${SERVER}/admin/dataForJobAlert`)
                .then(res=>{
                    console.log(res.data);
                })
                .catch(err=>{
                    console.log(err);
                });
});

app.listen(port,()=>{
    console.log(`server started on port ${port}`);
});
const mysql = require('mysql2');

// console.log(process.env.MYSQL_HOST);
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
}).promise();

// db.connect((err)=>{
//     if(err)
//         throw err;
//     console.log("mysql connected");
// })

module.exports = db;
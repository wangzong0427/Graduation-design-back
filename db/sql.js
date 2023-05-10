const mysql = require('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'cxq6998111',
    port: 3306,
    database: '毕业设计'
})


module.exports = connection
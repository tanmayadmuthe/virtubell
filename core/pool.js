const util = require('util');
const mysql = require('mysql2');
/**
 * Connection to the database.
 *  */
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root', // use your mysql username.
    password: 'system', // user your mysql password.
    database: 'virtubell'
});

pool.getConnection((err, connection) => {
    if(err) 
        console.error("Something went wrong connecting to the database ...");
    
    if(connection)
        console.log("Connected to the database");
        connection.release();
    return;
});

pool.query = util.promisify(pool.query);

module.exports = pool;
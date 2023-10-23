const pool = require('./pool');
const bcrypt = require('bcrypt');

function User() {}

User.prototype = {
    // Find the user data by id or email.
    find: function (user = null, callback) {
        // If the user variable is defined
        if (user) {
            // If user is a number, return field = id, if user is a string, return field = email.
            var field = Number.isInteger(user) ? 'id' : 'email';
            // Prepare the SQL query
            let sql = `SELECT * FROM users WHERE ${field} = ?`;

            pool.query(sql, user, function (err, result) {
                if (err) throw err;

                if (result.length) {
                    callback(result[0]);
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null); // Handle the case where user is not defined
        }
    },

    // This function will insert data into the database (create a new user)
    // Body is an object containing user data.
    create: function (body, callback) {
        var pwd = body.password;
        // Hash the password before inserting it into the database.
        body.password = bcrypt.hashSync(pwd, 10);
    
        // This array will contain the values of the fields.
        var bind = [];
        // Specify the fields to insert into the database (firstname, lastname, email, password).
        var fields = ['firstname', 'lastname', 'email', 'password'];
    
        // Loop through the fields and push the corresponding values from the body object into the bind array.
        for (var i = 0; i < fields.length; i++) {
            bind.push(body[fields[i]]);
        }
    
        // Prepare the SQL query with the specified fields.
        let sql = `INSERT INTO users(firstname, lastname, email, password) VALUES (?, ?, ?, ?)`;
    
        // Call the query, giving it the SQL string and the values (bind array).
        pool.query(sql, bind, function (err, result) {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Duplicate entry error (email already exists).
                    callback({ error: 'Email already exists. Please use a different email.' });
                } else {
                    // Handle other errors by calling the callback with the error object.
                    callback(err);
                }
            } else {
                // Return the last inserted id if there is no error.
                callback(result.insertId);
            }
        });
    },
    

    login: function (email, password, callback) {
        // Find the user data by their email.
        this.find(email, function (user) {
            // If there is a user with this email.
            if (user) {
                // Now we check their password using bcrypt.compare.
                bcrypt.compare(password, user.password, function (err, result) {
                    if (result === true) {
                        // Passwords match, user is authenticated
                        callback(user);
                    } else {
                        // Passwords do not match, user is not authenticated
                        callback(null);
                    }
                });
            } else {
                // If the email is not found, user is not authenticated
                callback(null);
            }
        });
    },
};

module.exports = User;
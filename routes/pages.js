const express = require('express');
const User = require('../core/user');
const pool = require('../core/pool'); 
const router = express.Router();

// Create an object from the class User in the file core/user.js
const user = new User();

// Get the index page
router.get('/', (req, res, next) => {
    let user = req.session.user;
    if (user) {
        res.redirect('home');
        return;
    }
    res.render('index', { title: "Home Page" });
});

// Your GET route for /register
router.get('/register', (req, res, next) => {
    const emailToCheck = req.query.email; // Assuming you're sending the email as a query parameter
    
    // Perform a query to check if the email exists
    pool.query('SELECT COUNT(*) AS count FROM users WHERE email = ?', [emailToCheck], (err, results) => {
      if (err) {
        // Handle the database query error
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      // Check the count of results to determine if the email exists
      const emailExists = results[0].count > 0;
  
      res.render('register', { title: 'Registration', duplicateEmail: emailExists });
    });
});  
  

// Add this route to open the login form
router.get('/login', (req, res, next) => {
    res.render('login', { title: 'Login' });
});

// Add this route to open the login form
router.get('/contact', (req, res, next) => {
    res.render('contact', { title: 'contact' });
});

//admin dashboard
router.get('/admin', (req, res, next) => {
    res.render('admin', { title: 'admin' });
});

// Assuming you have a route where you render the qrcode.pug template and pass the user object.
router.get('/qrcode', (req, res) => {
    const user = req.session.user; // Get the logged-in user from the session

    if (!user || !user.email) {
        // Handle the case where the user is not logged in or doesn't have an email
        return res.redirect('/login'); // Redirect to the login page or handle it as needed
    }

    // Render the qrcode.pug template and pass the user object
    res.render('qrcode', { user });
});


// Define a route for logging out
router.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Redirect to the homepage after logout
      res.redirect('/');
    });
  });
  

// Example route for rendering the dashboard
router.get('/dashboard', (req, res) => {
    if (req.session.user) {
      const user = req.session.user;
      res.render('dashboard', { title: 'Dashboard', user: user });
    } else {
      // Handle cases where the user is not logged in
      res.redirect('/login'); // Redirect to the login page or handle as needed
    }
  });
  


// Post login data
router.post('/login', (req, res) => {
    user.login(req.body.email, req.body.password, function (result) {
        if (result) {
            req.session.user = result;
            req.session.opp = 1;
            // Redirect to the dashboard page instead of rendering the "login" template
            res.redirect('/dashboard'); // Replace '/dashboard' with the actual URL of your dashboard page
        } else {
            res.render('login', { title: 'Login', errorMessage: 'Username/Password incorrect!' });
        }
    });
});


// Post register data
router.post('/register', (req, res, next) => {
    let userInput = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
    };

    user.find(userInput.email, function (existingUser) {
        if (existingUser) {
            // Email already exists, provide a warning.
            res.render('register', { title: 'Register', duplicateEmail: true });
        } else {
            // Email is unique, proceed with insertion.
            user.create(userInput, function (lastId) {
                if (lastId) {
                    user.find(lastId, function (result) {
                        req.session.user = result;
                        req.session.opp = 1;
                        res.render('register', { title: 'Register', successMessage: 'Registration successful!' });
                    });
                } else {
                    console.log('Error creating a new user ...');
                }
            });
        }
    });
});


// Route for handling logout
router.post('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});


// GET route to display the contact page for QR code owner
router.get('/contact/:email', (req, res) => {
    // Retrieve the email from the URL parameters
    const email = req.params.email;

    // Render the contact-owner.pug template with the email
    res.render('contact-owner', { title: 'Contact QR Code Owner', email });
});


// POST route to handle contact form submission
router.post('/contact/:email', (req, res) => {
    // Retrieve the email from the URL parameters
    const email = req.params.email;

    // Retrieve the submitted form data
    const { name, message } = req.body;

    // Perform actions to send the message to the QR code owner
    // You can implement the logic to send the message here

    // Redirect the user to a thank you page or any appropriate page
    res.redirect('/thank-you');
});






module.exports = router;

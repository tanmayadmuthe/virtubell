const express = require('express');
const session = require('express-session');
const path = require('path');
const pageRouter = require('./routes/pages'); // Assuming your routes are in a 'routes' directory
const app = express();
const PORT = process.env.PORT || 5000; // Use the specified port or 5000 as a default
const QRcode = require('qrcode');

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files: CSS, Images, JS files, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Template engine: Pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Session configuration
app.use(session({
    secret: 'Imagination',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 1000 * 30 // 30 minutes
    }
}));

// Routes
app.use('/', pageRouter); // Assuming your routes are defined in 'routes/pages.js'

// Registration page route
app.get('/register', (_req, res) => {
    res.render('register', { title: 'Register' }); // Render the registration form
});

// Error handling: Page not found (404)
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
});

// Error handling: Send errors to the client
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});

module.exports = app;

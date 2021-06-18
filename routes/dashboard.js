var fs = require('fs');
var Signage = require('../models/signage');
var fs = require('fs'),
    xml2js = require('xml2js');

module.exports = function (app, passport) {

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        res.render('login', {
            title: 'Signage',
            layout: 'layouts/login',
            css: ['style'],
            js: ['script']
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    }));

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        res.render('signup', {message: req.flash('signupMessage'), layout: 'layouts/main'});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard-visitor', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)


    /* GET home page. */
    app.get('/dashboard', function (req, res, next) {
        res.render('dashboard-home', {
            title: 'Dashboard',
            layout: 'layouts/dashboard',
            css: ['dashboard/datepicker3', 'dashboard/styles'],
            js: ['dashboard/bootstrap-datepicker', 'dashboard/custom', 'dashboard/dashboard']
        });
    });

    /* GET login page. */
    app.get('/login', function (req, res, next) {
        res.render('dashboard-home', {
            title: 'Login',
            layout: 'layouts/login',
            css: ['dashboard/styles'],
            js: ['dashboard/custom', 'dashboard/dashboard']
        });
    });

    /* GET register page. */
    app.get('/register', function (req, res, next) {
        res.render('dashboard-home', {
            title: 'Registration',
            layout: 'layouts/register',
            css: ['dashboard/styles'],
            js: ['dashboard/custom', 'dashboard/registration']
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    console.log(req.isAuthenticated())
    if (req.isAuthenticated())
        return next();
    else
        res.redirect('/login');
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function MyCSV(Fone, Ftwo, Fthree) {
    this.FieldOne = Fone;
    this.FieldTwo = Ftwo;
    this.FieldThree = Fthree;
};
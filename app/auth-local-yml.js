/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
/**
 * Passport JS strategy for local group
 */
var config = require('./config');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;


// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = function(app) {
    // Read shared auth creds from config

    // Render local login form.
    app.get('/login', function(req, res) {
        if(req.user) {
            return res.redirect('/');
        }
        res.render('login', {
            title: 'Log in',
            formAuth: true,
            authError: !!req.flash('error').length
        });
    });

    // Validate login values
    app.post('/login', urlencodedParser, passport.authenticate('local', {
        failureRedirect: '/login',
        successReturnToOrRedirect: '/',
        failureFlash: true
    }));

    // Local auth strategy compares against shared auth creds set in the config
    // at server start time
    return (new Strategy(function(username, password, cb) {
        var users = config.get('USERS');
        console.log('username', username);
        console.log('password', password);
        if(!users[username])
            return cb(null, false, {message: 'invalid username'});
        if(users[username] == password){
            return cb(null, {username: username});
        }else{
            return cb(null, false, {message: 'invalid password'});
        }
    }));
};
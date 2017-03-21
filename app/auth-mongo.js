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
const User = require('./models/User');
var LocalStrategy = require('passport-local').Strategy;


// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findById(id).populate('group').exec( function(err, user){
        done(err, user);
    });
});

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

    // app.get('/setPassword', function(req, res) {
    //     if(req.user) {
    //         return res.redirect('/');
    //     }
    //     res.render('login', {
    //         title: 'Log in',
    //         formAuth: true,
    //         authError: !!req.flash('error').length
    //     });
    // });

    // Validate login values
    app.post('/login', urlencodedParser, passport.authenticate('local', {
        failureRedirect: '/login',
        successReturnToOrRedirect: '/',
        failureFlash: true
    }));

    // Local auth strategy compares against shared auth creds set in the config
    // at server start time
    return (new LocalStrategy(function(name, password, done) {
        console.log('name:' + name + '  pwd:' + password);
        User.findOne({ name: name}).populate('group').exec(function(err, user){
            console.log('find name:' + name);
            if (err) { return done(err); }
            if (!user) {
                console.log('Not find name:' + name);
                return done(null, false, { message: 'name not found.' });
            }
            user.comparePassword(password, function(err, isMatch){
                if (err) {return done(null, false, { message: 'name not found.' }); }
                if (isMatch) {
                    console.log('user-group', user.group);
                    console.log('user-group-name', user.group.name);
                    return done(null, user);
                }else{
                    console.log('Invalid password.' + password);
                    return done(null, false, { message: 'Invalid password.' });
                }

            });
        });
    }));

};

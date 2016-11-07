var passport = require('passport');
var util = require('util')
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , InstagramStrategy = require('passport-instagram').Strategy;


var session = require('express-session');
var model = require('../model/model');
var google_creds = process.env.mode === 'production' ? {
    "GOOGLE_CLIENT_ID": process.env['GOOGLE_CLIENT_ID'],
    "GOOGLE_CLIENT_SECRET": process.env['GOOGLE_CLIENT_SECRET'],
    "GOOGLE_CALLBACK_URL": process.env['GOOGLE_CALLBACK_URL']
} : require('../config');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: google_creds.GOOGLE_CLIENT_ID,
        clientSecret: google_creds.GOOGLE_CLIENT_SECRET,
        callbackURL: google_creds.GOOGLE_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {

        // can store user details to mongodb here ...
        console.log(profile.emails[0].value);

        if (passport.customdata) {
            passport.customdata.accessToken = accessToken;
        } else {
            passport.customdata = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's Google profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Google account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));


module.exports = function (app) {

    // run all the passport js code ...

    console.log('have access to app ... ');

    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }),
        function(req, res){
            // The request will be redirected to Google for authentication, so this
            // function will not be called.
        });

    var acl = ['jatholeny@gmail.com'];
    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
            console.log('======');
            console.log(req.user);
            app.tokens = {
                gmail: passport.customdata
            };
            // ============= store the user details to MongoDB Start ======
            model.ContactModel.findOne({google_id:req.user.id},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    if(!result){
                        if(acl.indexOf(req.user.emails[0].value) !== -1){
                            new model.ContactModel({
                                google_id:req.user.id,
                                name:{
                                    first:req.user.name.givenName,
                                    last:req.user.name.familyName
                                },
                                email:req.user.emails[0].value,

                                photo:req.user.photos[0].value,
                                type:'admin'
                            }).save(function(err){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.redirect('/');
                                    }
                                });
                        }else{
                            new model.ContactModel({
                                google_id:req.user.id,
                                name:{
                                    first:req.user.name.givenName,
                                    last:req.user.name.familyName
                                },
                                email:req.user.emails[0].value,
                                photo:req.user.photos[0].value,
                                type:'staff'
                            }).save(function(err,result){
                                    if(err){
                                        console.log(err);
                                    }else{
                                        res.redirect('/');
                                    }
                                });

                        }
                    }else{
                        res.redirect('/');
                    }

                }

            });

            // ============= store the user details to MongoDB End ================
        });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });


};
var express = require("express");
var User = require("../models/users");
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('./config');
var mongoose = require("mongoose");
var nev = require("email-verification")(mongoose);

var hostUrl = 'https://lab5-backend-3-che57.c9users.io';

nev.configure({
    verificationURL: hostUrl + '${URL}',
    persistentUserModel: User,
    emailFieldName: 'userName',
    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'cheassignment2@gmail.com',
            pass: 'che123uwo'
        }
    },
    verifyMailOptions: {
        from: 'Do Not Reply <cheassignment2_do_not_reply@gmail.com>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
}, function(error, options){
});
nev.generateTempUserModel(User, function(){});

// using a predefined file
var TempUser = require('../models/tempUser');
nev.configure({
    tempUserModel: TempUser
}, function(error, options){
});

//cheassignment2
//che123uwo

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.route('/register').post((req, res) => {
    var user = new User();
    user.userName = req.body.userName;
    var password = req.body.password;
    user.isAdmin = req.body.isAdmin;
    user.state = 1;
    
    if(user.userName == '' || user.userName == null){
        res.json({msg: 'missing userName'});
    }
    else if(password == '' || password == null){
        res.json({msg: 'missing password'});
    }
    else if(user.isAdmin != false && user.isAdmin != true){
        console.log(user.isAdmin);
        res.json({msg: 'missing account type!'});
    }
    else{
        User.findOne({userName: req.body.userName}, (err, userE) => {
            if (err) res.send(err);
            if (userE) return res.json({auth: false, msg: 'User exists!'});
            else {
                bcrypt.genSalt(saltRounds, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        if(err) res.send(err);
                        user.password = hash;
                        user.save((err)=>{
                            if(err) res.send(err);
                            res.json({isRegistered: true, msg: 'Register successfully!!'});
                        })
                    })
                });
            }
        });
        // nev.createTempUser(user, function(err, existingPersistentUser, newTempUser) {
        //     // some sort of error
        //     if (err)
        //         return res.send(err);
        //     // user already exists in persistent collection...
        //     if (existingPersistentUser){
        //         return res.json({msg: 'User is existing.'});
        //     }
        //
        //     // a new user
        //     if (newTempUser) {
        //         var URL = newTempUser[nev.options.URLFieldName];
        //         nev.sendVerificationEmail(user.userName, URL, function(err, info) {
        //             if (err) res.send(err);
        //             else{
        //                 bcrypt.genSalt(saltRounds, (err, salt) => {
        //                     bcrypt.hash(password, salt, (err, hash) => {
        //                         if(err) res.send(err);
        //                         user.password = hash;
        //                         user.save((err)=>{
        //                             if(err) res.send(err);
        //                             res.json({isRegistered: true, msg: 'Register successfully!!'});
        //                         })
        //                     })
        //                 });
        //             }
        //         });
        //
        //     // user already exists in temporary collection...
        //     } else {
        //         res.json({msg: 'fail to verify email'});
        //         // flash message of failure...
        //     }
        // });
    }
});
    
router.route('/login').post((req, res) => {
    User.findOne({userName: req.body.userName}, (err, user) => {
        if(err) res.send(err);
        if(!user) return res.json({auth: false, msg: 'Username or Password is invalid!'});
        
        bcrypt.compare(req.body.password, user.password, (err, isValid) => {
            if(!isValid) return res.json({auth: false, msg: 'Username or Password is invalid!'});
            else if(err) return res.send(err);
            else if(user.state == 0) return res.json({auth: false, msg: 'The account is deactivated, please contact the store manager. . .'})
            else{
                if(user.isAdmin == true){
                    var token = jwt.sign({id: user._id, isAdmin: user.isAdmin}, config.secret, {expiresIn: 86400});
                    res.send({auth: true, token: token, userName: user.userName, admin: true});
                }
                else{
                    var token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400});
                    res.send({auth: true, token: token, userName: user.userName, admin: false});
                }
            }
        });
    })
});

router.route('/logout').get((req, res) => {
    res.send({auth: false, token: null, userName: null, admin: false});
})

module.exports = router;
    
// auth: { 0: guest, 1: user, 2: admin }
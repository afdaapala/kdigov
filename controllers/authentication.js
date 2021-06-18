'use strict';

var jwt = require('jsonwebtoken');
var User = require('@models/user');
var authConfig = require('@configs/auth');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var Area = require('@models/area');
var lib = require('@libraries/library');



function generateToken(user) {
    return jwt.sign(user, authConfig.secret, {
        expiresIn: 10080
    });
}

function setUserInfo(request) {
    return {
        _id: request._id,
        email: request.email,
        role: request.role
    };
}


exports.loginPage = function(req, res, next) {

    res.render('dashboard-home', {
        title: 'Login',
        layout: 'layouts/login',
        css: ['dashboard/styles'],
        js: ['dashboard/custom', 'dashboard/login']
    });

}

exports.registerPage = function(req, res, next) {

    res.render('dashboard-home', {
        title: 'Registration',
        layout: 'layouts/register',
        css: ['dashboard/styles'],
        js: ['dashboard/custom', 'dashboard/registration']
    });

}


exports.login = function(req, res, next) {

    var userInfo = setUserInfo(req.user);

    req.session.token = 'Bearer ' + generateToken(userInfo)
    res.status(200).json({
        token: 'Bearer ' + generateToken(userInfo),
        user: userInfo
    });

}

exports.loginRedirect = function(req, res, next) {



}

exports.register = function(req, res, next) {

    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var areaID = req.body.areaID;
    var role = req.body.role;

    if (!email) {
        return res.status(422).send({ error: 'Email tidak boleh kosong' });
    }

    if (!password) {
        return res.status(422).send({ error: 'Password tidak boleh kosong' });
    }

    User.findOne({ email: email }, function(err, existingUser) {

        if (err) {
            return next(err);
        }

        if (existingUser) {
            return res.status(422).send({ error: 'Email sudah pernah digunakan' });
        }

        var user = new User({
            area: areaID,
            name: name,
            email: email,
            password: password,
            role: role
        });

        user.save(function(err, user) {

            if (err) {
                return next(err);
            }

            var userInfo = setUserInfo(user);
            var options = { upsert: true, new: true, runValidators: true };
            lib.updateData(Area, { _id: user.area }, { $push: { users: user.id } }, options, function(result) {
                res.status(201).json({
                    token: 'JWT ' + generateToken(userInfo),
                    user: userInfo
                })
            })



        });

    });

}

exports.roleAuthorization = function(roles) {

    return function(req, res, next) {
        var user = req.user;

        User.findById(user._id, function(err, foundUser) {

            if (err) {
                res.status(422).json({ error: 'No user found.' });
                return next(err);
            }

            if (roles.indexOf(foundUser.role) > -1) {
                return next();
            }

            res.status(401).json({ error: 'You are not authorized to view this content' });
            return next('Unauthorized');

        });

    }

}
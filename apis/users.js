'use strict';
var express = require('express'),
    db = require('../models'),
    logger = require('../helpers/logger'),
    moment = require('moment'),
    config = require('config'),
    crypto = require('crypto'),
    router = express.Router(),
    cache = require('../helpers/cache.js'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');
// create a new user
router.post('/create', function(req, res){
    var user = new db.User(req.body);
    user.save(function(error, new_user){
        if (error) {
            return res.status(406).send(JSON.stringify({error}));
        }

        // send email to user
        logger.info("Send email to user", new_user.email);
        var transporter = nodemailer.createTransport(smtpTransport(config.get('mailer')));
        transporter.sendMail({
          from: config.get('mailer.from'),
          to: new_user.email,
          subject: 'Thank you',
          html: 'Hi, <br/> Thank you'

        });

        // remove security attributes
        new_user = user.toObject();
        if (new_user) {
            delete new_user.hashed_password;
            delete user.salt;
        }
        res.send(JSON.stringify(new_user));
    });
});


// update user
router.put('/update',function(req,res){
  // get a user with ID of 1
db.User.findById(1, function(err, user) {
  if (err) throw err;

  user.username= asdsd;
  user.password=12323;

  // save the user
  user.save(function(err) {
    if (err) throw err;
  });

});
})

// get a user by id
router.get('/get/:id', function(req, res){
    logger.debug('Get User By Id', req.params.id);
    cache.get('get_user_by_id'+req.params.id, function(err,reply){
      if (!err && reply) {
        logger.debug('Get Data from cache');
        return res.send(reply);
      } else {
        db.User.findOne({
            _id: req.params.id
        })
    }
    // remove security attributes
    user = user.toObject();
    if (user) {
        delete user.hashed_password;
        delete user.salt;
    }
    // save to cache
    logger.debug = "done";
    cache.set('get_user_by_id'+req.params.id,JSON.stringify(user));
    res.send(JSON.stringify(user));
    }).catch(function(e){
        res.status(500).send(JSON.stringify(e));
    });
});

// get list of users
router.get('/list/:page/:limit', function(req, res){
    var limit = (req.params.limit)? req.params.limit: 10;
    var skip = (req.params.page)? limit * (req.params.page - 1): 0;
    db.User
    .find()
    .skip(skip)
    .limit(limit)
    .sort({'_id': 'desc'})
    .then(function(users) {
        res.send(JSON.stringify(users));
    }).catch(function(e) {
        res.status(500).send(JSON.stringify(e));
    });
});

// login
router.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    db.User.findOne({
        username: username
    }).then(function(user){
        if (!user.authenticate(password)) {
            throw false;
        }
        db.Token.findOne({
            username: username
        }).then(function(t){
            t.remove(function() {
                crypto.randomBytes(64, function(ex, buf) {
                    var token = buf.toString('base64');
                    var today = moment.utc();
                    var tomorrow = moment(today).add(config.get('token_expire'), 'seconds').format(config.get('time_format'));
                    var token = new db.Token({
                        username: username,
                        token: token,
                        expired_at: tomorrow.toString()
                    });
                    token.save(function(error, to){
                        return res.send(JSON.stringify(to));
                    });
                });
            });
        });
    }).catch(function(e){
        res.status(401).send(JSON.stringify(e));
    });
});

module.exports = router;

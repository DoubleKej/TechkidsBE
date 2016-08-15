'use strict';
var express = require('express'),
    db = require('../models'),
    logger = require('../helpers/logger'),
    moment = require('moment'),
    config = require('config'),
    crypto = require('crypto'),
    router = express.Router();

// create a new Product
router.post('/create', function(req, res){
    var product = new db.Product(req.body);
    user.save(function(error, new_product){
        if (error) {
            return res.status(406).send(JSON.stringify({error}));
        }
        // remove security attributes
        new_product = product.toObject();
        res.send(JSON.stringify(new_product));
    });
});

router.get('/list/:page/:limit', function(req, res){
    var limit = (req.params.limit)? req.params.limit: 10;
    var skip = (req.params.page)? limit * (req.params.page - 1): 0;
    db.Product
    .find()
    .skip(skip)
    .limit(limit)
    .sort({'_id': 'desc'})
    .then(function(product) {
        res.send(JSON.stringify(product));
    }).catch(function(e) {
        res.status(500).send(JSON.stringify(e));
    });
});


module.exports = router;

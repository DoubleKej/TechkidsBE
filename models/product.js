var mongoose = require('mongoose');
var crypto = require('crypto');
var logger = require('../helpers/logger');
var Schema = mongoose.Schema;
var CreateUpdatedAt = require('mongoose-timestamp');

// Define Product Schema
var Product = new Schema({
    SKU: {
        type: String,
        index: true,
        require: true,
        unique: true,
    },
    productname: {
        type: String,
        unique: true,
        require: true,
    },
    amount: {
        type: String,
        require: true
    },
    description: {
        type: String
    }
});




module.exports = mongoose.model('Product', Product);

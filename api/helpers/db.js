// Get variables
var mongoose = require('mongoose');
var config = require('config');
var Promise = require('bluebird');

mongoose.set('debug', true);

// Connect the db
mongoose.connect(config.get('db.url'));

// DB as variables
//var db = mongoose.createConnection;

module.exports = mongoose;

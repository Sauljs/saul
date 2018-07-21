// Get variables
var mongoose = require('mongoose');
var Promise = require('bluebird');

// DB as variables
//var db = mongoose.createConnection;

module.exports = (dbUrl) => {
	mongoose.set('debug', true);

	// Connect the db
	mongoose.connect(dbUrl);

	return mongoose;
}

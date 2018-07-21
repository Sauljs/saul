var api = require('./api');
var mongoose = require('./helpers/db');

module.exports = function(options) {
	var db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function() {
		return api(options);
	});
}
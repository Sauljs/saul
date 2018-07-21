var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = new Schema({
	user_id: ObjectId,
	email: String,
	password: String,
	created_at: Date,
	updated_at: Date
});

module.exports = User;
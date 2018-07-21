var mongoose = require('./helpers/db');

//var mongoose = require('mongoose');

// {
// 	api_name: 'user',
// 	uniqId: true, // Default true
// 	timestamps: true, // Default true
// 	fields: {
// 		email: String,
// 		password: String,
// 		birthdate: Number
// 	]
// }

module.exports = function(apiObj) {
	var obj = apiObj.fields;
	var schema;

	// if (apiObj.timestamps) {
	// 	obj.createdAt = Number;
	// 	obj.updatedAt = Number;
	// }

	if (apiObj.settings) {
		schema = new mongoose.Schema(obj, apiObj.settings);
	} else {
		schema = new mongoose.Schema(obj);
	}

	return mongoose.model(apiObj.apiName, schema);
}
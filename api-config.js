var mongoose = require('mongoose');
var createSchema = require('./api/createSchema');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Blocks = new Schema({ 
	text: String 
});

var userSchema = {
	apiName: 'user',
	access: {
		getOne: 'std_user',
		get: 'moderator',
		create: 'moderator',
		update: 'moderator',
		del: 1000 // Admin
	},
	hiddenFields: ['password'], // Fields not to return
	fields: {
		email: String,
		password: String,
		birthdate: Number
	},
	settings: {
		timestamps: true
	}
}

// Declare primary schemas
module.exports = [
	userSchema,
	{
		apiName: 'supertest',
		fields: {
			name: String
		},
		settings: {
			timestamps: false
		}
	}, 
	{
		apiName: 'cats',
		fields: {
			name: String,
			age: Number
		},
		settings: {
			timestamps: true
		}
	}, 
	{
		apiName: 'test',
		fields: {
			name: String,
			description: String,
			age: Number,
			blocks: [Blocks]
		},
		settings: {
			timestamps: true
		}
	}
];

// Middleware example

// middleware: {
// 	pre: {
// 		getOne: function(req, res, next) {
// 			next();
// 		}
// 	},
// 	post: {
// 		getOne: function(req, res, next) {
// 			var result = req.apiResult;

// 			res.status(200).json(result);
// 		}
// 	}
// }
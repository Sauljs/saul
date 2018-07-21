// Include modules
var express = require('express');
var route = express.Router();
var config = require('config');
var _ = require('lodash');
var Promise = require('bluebird');

var createSchema = require('./createSchema');


// TODO - Support one to squillions
// https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1

var defaultPermissions = {
	super_admin: 5000,
	admin: 1000,
	moderator: 750,
	std_user: 500
}

var baseAccess = {
	getOne: 0,
	get: 0,
	create: 0,
	update: 0,
	del: 0
};

function hasValue(value) {
	return !_.isUndefined(value) && value !== 'undefined' && !_.isNull(value) && value !== 'null';
}

function isObject(value) {
	var string = JSON.stringify(value);

	return _.isObject(value) && string.indexOf('{') === 0 && string.charAt(string.length - 1) === '}';
}

module.exports = function(options) {
	if (!options) {
		return new Error('Missing options check https://...');
	}

	options.baseUrl = options.baseUrl || '/api';
	options.cache = hasValue(options.cache) ? options.cache : false;
	options.allowed_permissions = hasValue(options.allowed_permissions) ? options.allowed_permissions : defaultPermissions;

	var PERM = require('./helpers/permissions')(options.allowed_permissions);

	console.log("PERM.ha(1000, 'admin'): ", PERM.ha(1000, 'admin'));

	var socket = options && options.socket;
	var routeConfig = options && options.routeConfig && options.routeConfig;
	//var app = options && options.app;

	var routes = {};

	Promise.map(routeConfig, createRoutes)
		.then(function(results) {
			return Promise.map(results, function(obj) {
				routes[obj.apiObj.apiName] = obj.operations;

				return obj;
			})
		})
		.then(function(results) {
			_.map(results, function(obj) {
				//console.log("obj: ", obj);
				// Attach routes
				console.log("obj.createUrl: ", obj.createUrl);
				route.get(obj.getOneUrl, [
					// Attaching access
					function(req, res, next) {
						req.accessDefinition = obj.access && isObject(obj.access) ? _.merge(baseAccess, obj.access) : baseAccess;

						next();
					}, 
					obj.operations.getOne
				]);

				route.post(obj.getUrl, obj.operations.get);
				route.post(obj.createUrl, obj.operations.create);
				route.post(obj.updateUrl, obj.operations.update); // Works as a patch, and upsert event
				route.delete(obj.deleteUrl, obj.operations.del);
			})
		});

	

	function createRoutes(apiObj) {
		return new Promise(function(resolve, reject) {
			// Verify data format
			if (!apiObj.apiName) {
				return reject('Remember to set an api name');
			}

			// Set variables
			var Schema = createSchema(apiObj);
			var allowedFields = _.chain(apiObj.fields)
				.map(function(field, key) {
					return key;
				})
				.filter(function(key) {
					var ignoredFields = ['__v', 'createdAt', 'updatedAt'];

					return ignoredFields.indexOf(key) === -1;
				})
				.value();

			var updateApiOptions = {
				upsert: true
			};

			var getOneUrl = '/' + apiObj.apiName + '/getone/:id';
			var getUrl = '/' + apiObj.apiName + '/get';
			var createUrl = '/' + apiObj.apiName + '/create';
			var updateUrl = '/' + apiObj.apiName + '/update';
			var deleteUrl = '/' + apiObj.apiName + '/delete';

			var operations = {
				getOne: [getOne],
				get: [get],
				create: [create],
				update: [update],
				del: [del]
			};

			var operationsValidation = {
				getOne: false,
				get: false,
				create: false,
				update: false,
				del: false
			};

			// Add middleware
			if (apiObj.middleware) {
				if (apiObj.middleware.pre) {
					_.forEach(apiObj.middleware.pre, function(func, key) {
						operations[key].unshift(func);
					});
				}

				if (apiObj.middleware.post) {
					_.forEach(apiObj.middleware.post, function(func, key) {
						operations[key].push(func);

						operationsValidation[key] = true;
					});
				}
			}

			resolve({
				apiObj: apiObj,
				operations: operations,
				getOneUrl: getOneUrl,
				getUrl: getUrl,
				createUrl: createUrl,
				updateUrl: updateUrl,
				deleteUrl: deleteUrl
			});

			function getOne(req, res, next) {
				var id = req.params.id;

				Schema.findById(id,
					function(err, item) {
						if (err) {
							return res.status(500).send(baseObj(false, 'GETONE'));
						}

						var successObj = baseObj(true, 'GETONE', item);

						if (operationsValidation.getOne) {
							req.apiResult = successObj;

							return next();
						} else {
							return res.status(200).send(successObj);
						}
					});
			}

			function get(req, res, next) {
				var query = _.isUndefined(req.body.query) ? {} : req.body.query;
				var options = _.isUndefined(req.body.options) ? {} : req.body.options;
				var count = _.isUndefined(req.body.count) ? {} : req.body.count;
				var customAllowedFields = _.cloneDeep(allowedFields);

				if (options && options.attributes) {
					customAllowedFields = _.filter(customAllowedFields, function(field) {
						return options.attributes.indexOf(field) > -1;
					});
				}

				console.log("query: ", query);
				console.log("customAllowedFields: ", customAllowedFields);
				console.log("options: ", options);
				console.log("count: ", count);

				Schema.find(
					query, 
					customAllowedFields, 
					options,
					function(err, items) {
						console.log("items: ", items);
						console.log("err: ", err);
						if (err) {
							return res.status(500).send(baseObj(false, 'GET'));
						}

						var successObj = baseObj(true, 'GET', items);

						if (count) {
							Schema.find(query)
								.count()
								.exec(function(err, count) {
									if (err) {
										console.log("err: ", err);
										return res.status(500).send(baseObj(false, 'GET'));
									}

									successObj.count = count;

									success(successObj);
								});
						} else {
							success(successObj);
						}
					});

				function success(successObj) {
					console.log("successObj: ", successObj);
					if (operationsValidation.get) {
						req.apiResult = successObj;

						return next();
					} else {
						return res.status(200).send(successObj); 
					}
				}
			}

			function create(req, res, next) {
				var fBody = _.pull(req.body, allowedFields);

				var newSchema = new Schema(fBody);

				newSchema.save(function(err, item) {
					if (err) {
						return res.status(500).send(baseObj(false, 'CREATE'));
					}

					var successObj = baseObj(true, 'CREATE', item);

					if (operationsValidation.create) {
						req.apiResult = successObj;

						return next();
					} else {
						return res.status(200).send(successObj);
					}
				});
			}

			function update(req, res, next) {
				var fBody = _.pull(req.body, allowedFields);

				Schema.findByIdAndUpdate(req.body.id, fBody, updateApiOptions,
					function(err, oldDoc) {
						if (err) {
							return res.status(500).send(baseObj(false, 'UPDATE'));
						}

						var successObj = baseObj(true, 'UPDATE');

						if (operationsValidation.update) {
							req.apiResult = successObj;

							return next();
						} else {
							return res.status(200).send(successObj);
						}
					});
			}

			function del(req, res, next) {
				Schema.findByIdAndRemove(req.body.id,
					function(err) {
						if (err) {
							return res.status(500).send(baseObj(false, 'DELETE'));
						}

						var successObj = baseObj(true, 'DELETE');

						if (operationsValidation.del) {
							req.apiResult = successObj;

							next();
						} else {
							return res.status(200).send(successObj);
						}
					});
			}

			function baseObj(success, type, data) {
				var baseMessage = type + '_' + apiObj.apiName.toUpperCase() + '_';

				if (success) {
					var successObj = {
						success: true,
						message: baseMessage + 'SUCCESS'
					};

					if (data) {
						successObj.data = data;
					}

					return successObj;
				} else {
					return {
						success: false,
						message: baseMessage + 'FAILED'
					}
				}
			}
		});
	}

	return route;
}


// News.find({
//     deal_id:deal._id // Search Filters
// },
// ['type','date_added'], // Columns to Return
// {
//     skip:0, // Starting Row
//     limit:10, // Ending Row
//     sort:{
//         date_added: -1 //Sort by Date Added DESC
//     }
// },
// function(err,allNews){
//     socket.emit('news-load', allNews); // Do something with the array of 10 objects
// })
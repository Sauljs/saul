# Saul
Backend REST api without the headache

## Who is Saul?
We're building a autogeneated backend api, so you can worry about your customers, and building great applications. This is buildt to simplify everything related to building api's

## Table of contents
* [What is Saul made of?](#madeof)
* [File structure](#file-structure)
* [Getting Started](#getting-started)
* ... More to come

## <a name="madeof"></a>What is Saul made of?
* Mongodb
* Mongoose
* Redis
* Nodejs

## <a name="file-structure"></a>File structure
```
- api/ #This is where the magic happens
    - api.js #File where we generate the api based on the api-config.js parsed when running the index.js
    - createSchema.js #Used to build the schemas as needed for the api.js
- example/ #Frontend example using the api
- api-config.js #Config the api using mongoose
- index.js #Example code
```

## <a name="getting-started"></a>Getting started

* npm i -S sauljs
* require Saul `const Saul = require('sauljs')`
* Create a saul-config.js

```javascript
// Declare primary schemas
module.exports = [
	{
		apiName: 'user', // Define a name for your api this will result in baseUrl + '/user'
		fields: {
			email: String,
			password: String,
			birthdate: Number
		},	// Here we define the field settings just like in mongoose this is actually forwarded to the mongoose api so the fields work just like mongoose
		hiddenFields: ['password'], Here you can define which fields you dont what to return like a password maybe
		settings: {
			timestamps: true
		}, // This settings object is passed on to mongoose as is so you can define all setings in mongoose right here
		access: {
			getOne: 'std_user',
			get: 'moderator',
			create: 'moderator',
			update: 'moderator',
			del: 1000 // Admin
		}, // In this section you can define pr method which access level you need to have to do a certain operation, default is that everything is accessable
		middleware: {
			pre: {
				// Modify requests before they hit the database
				// All methods is allowed getOne, get, create, update & del
				getOne: function(req, res, next) {
					next();
				}
			},
			post: {
				// Modify requests after they return from the database
				// All methods is allowed getOne, get, create, update & del
				getOne: function(req, res, next) {
					var result = req.apiResult;

					res.status(200).json(result);
				}
			}
		}
	}
];
```

* Initiate Saul
```javascript
let routeConfig = require('./saul-config');
let options = {
  baseUrl: '/api',
  routeConfig: routeConfig, // Get the routing config you made
  cache: true, //Toggle if it should utilize redis caching
  allowed_permissions: {
    super_admin: 5000,
    admin: 1000,
    moderator: 750,
    std_user: 500
  } // Define a permissions array and defining an integer that represent the role in value, the higher the number the higher the permissions
};

let Saul = Saul(options);
app.use('/api', Saul);
```

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
    - auth-facebook.js #Testing support for jwt based api connection
    - createSchema.js #Used to build the schemas as needed for the api.js
    - index.js #The wrapper to initate the database when we startup the project
- config/ #Example code
- public/ #Example code
- api-config.js #Config the api using mongoose
- index.js #Example code
```

## <a name="getting-started"></a>Getting started

* npm i -S sauljs
* require Saul `const Saul = require('sauljs')`
* Create a saul-config.js

```
Documentation is coming
```

* Initiate Saul
```
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
/*/ -------------------------------- /*/
///      Setup global veriables      ///
/*/ -------------------------------- /*/

// Prep express
var express = require('express');
var app = express();

// Get other modules
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var morgan = require('morgan');

// Vars
var port = process.env.PORT || 3000;
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Read cookies and json
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('somesecret'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Security middleware
// app.use('/api/', [checkToken, checkPermission]);
var routeConfig = require('./saul-config');
var Saul = require('./api/index').api({
  //socket: false,
  baseUrl: '/api',
  databaseUrl: 'mongodb://localhost/saul',
  routeConfig: routeConfig,
  cache: true,
  allowed_permissions: {
    super_admin: 5000,
    admin: 1000,
    moderator: 750,
    std_user: 500
  }
});

app.use('/api', Saul);

//app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

// Error logging
app.use(morgan('combined', {
  skip: (req, res) => {
    return res.statusCode < 400;
  }
}));

/**
 *  Start up the engine
 */
app.listen(port, () => {
	console.log('Express server listening on port: %d', port);
});

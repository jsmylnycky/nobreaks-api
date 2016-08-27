'use strict';

let bodyParser = require('body-parser');
let cors = require('cors');
let express = require('express');
let helmet = require('helmet');
let mongoose = require('mongoose');
let passportConfig = require('./lib/auth/passport');
let router = express.Router();
let serveStatic = require('serve-static');
let conf = require('./nobreaks.conf.json');
// let session = require('express-session');
// let MongoStore = require('connect-mongo')(session);

let app = module.exports = express();

// App setup
app.use(cors());
app.set('port', (process.env.PORT || 5001));

// Security
app.set('trust proxy', 1) // trust first proxy

app.use(helmet());
app.disable('x-powered-by');

// Database setup
mongoose.connect('mongodb://127.0.0.1:27017/nobreaks')
mongoose.Promise = global.Promise;

app.set('superSecret', conf.jwt.secret);

/* app.use(session({
    secret: 'n0bre4k$!',
    cookie: { secure: true },
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
); */

// Form submission
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Routes setup
app.use('/v1', router)

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({error: {message: err.message}});
});

// CDN directory
app.use(serveStatic(__dirname + '/static', {
  'index': false
}));

// Passport
passportConfig(app);

require('./lib/auth/index')(app);
require('./lib/character/index')(router);
require('./lib/epgp/index')(router);
require('./lib/guild/index')(router);
require('./lib/item/index')(router);

if (app.get('env') === 'development') {
  let fs = require('fs');
  let https = require('https');

  let sslOptions = {
    key: fs.readFileSync(__dirname + '/ssl/localhost.key'),
    cert: fs.readFileSync(__dirname + '/ssl/localhost.crt')
  };

  var server = https.createServer(sslOptions, app).listen(app.get('port'), function() {
    console.log('Listening on port %d', app.get('port'));
    console.log('To test this example, navigate to https://localhost:' + app.get('port') +'/auth/bnet');
    console.log('You\'ll have to accept a security exception for the self signed SSL certificate.');
  });
} else {
  app.listen(app.get('port'), () => {
    console.log('No Breaks API is running on port', app.get('port'));
  });
}

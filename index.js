'use strict';

let cors = require('cors');
let express = require('express');
let helmet = require('helmet');
let mongoose = require('mongoose');
let router = express.Router();
let session = require('express-session');
let bodyParser = require('body-parser');

let app = module.exports = express();

// App setup
app.use(cors());
app.set('port', (process.env.PORT || 5001));

// Security
app.set('trust proxy', 1) // trust first proxy

app.use(helmet());
app.disable('x-powered-by');
app.use(session({
   secret: 's3Cur3',
   name: 'sessionId',
  })
);

// Form submission
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Routes setup
app.use('/v1', router)

// Database setup
mongoose.connect('mongodb://127.0.0.1:27017/nobreaks')
mongoose.Promise = global.Promise;

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({error: {message: err.message}});
});

// CDN directory
app.use('/cdn', express.static('cdn'));

require('./lib/character/index')(router);
require('./lib/epgp/index')(router);
require('./lib/guild/index')(router);
require('./lib/item/index')(router);

app.listen(app.get('port'), () => {
  console.log('No Breaks API is running on port', app.get('port'));
});

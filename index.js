'use strict';

let express = require('express');
let helmet = require('helmet');
let mongoose = require('mongoose');
let router = express.Router();
let session = require('express-session');

let app = module.exports = express();

// App setup
app.set('port', (process.env.PORT || 3000));

// Security
app.set('trust proxy', 1) // trust first proxy

app.use(helmet());
app.disable('x-powered-by');
app.use(session({
   secret: 's3Cur3',
   name: 'sessionId',
  })
);

// Routes setup
app.use('/v1', router)
app.set('port', (process.env.PORT || 5000));

// Database setup
mongoose.connect('mongodb://127.0.0.1:27017/nobreaks')

require('./lib/character/index')(router);
require('./lib/guild/index')(router);

app.listen(app.get('port'), () => {
  console.log('No Breaks API is running on port', app.get('port'));
});

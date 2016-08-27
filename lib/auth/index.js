'use strict';

let controller = require('./controller');
let passport = require('passport');

function authRoutes(app) {
  app.get('/auth/bnet', passport.authenticate('bnet'));
  app.get('/auth/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/' }), controller.authenticate);
  app.get('/logout', controller.logout);
};

module.exports = authRoutes;

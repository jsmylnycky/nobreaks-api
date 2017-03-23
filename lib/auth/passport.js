'use strict';

let passport = require('passport');
let conf = require('../../nobreaks.conf.json');
let BnetStrategy = require('passport-bnet').Strategy;

function config(app) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(
    new BnetStrategy({
      clientID: conf.battlenet.key,
      clientSecret: conf.battlenet.secret,
      scope: 'wow.profile',
      callbackURL: conf.battlenet.callbackURL
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        return done(null, profile);
      });
    })
  );

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = config;

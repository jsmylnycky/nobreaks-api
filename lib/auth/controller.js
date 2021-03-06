'use strict';

let conf = require('../../nobreaks.conf.json');
let jwt = require('jsonwebtoken');
let User = require('../user/model');

function authenticate(req, res) {
  let body = {
    bnetId: req.user.id,
    battletag: req.user.battletag,
    token: req.user.token,
    provider: req.user.provider
  };

  User
   .findOneAndUpdate(
     {bnetId: req.user.id, battletag: req.user.battletag},
     body,
     {upsert: true}
   )
   .exec()
   .then(() => {
     let token = jwt.sign({
       bnetId: req.user.id,
       battletag: req.user.battletag
     }, req.app.get('superSecret'), {
       // expiresInMinutes: 1440 // expires in 24 hours
     });

     res.cookie('token', token, {
       domain: (req.app.get('env') === 'local') ? 'localhost' : '.nobreaksguild.com',
       secure: true
     });

     res.redirect(conf.battlenet.redirectURL)
     //res.redirect(req.headers.referer || '/');
   });
}

function logout(req, res) {
  req.logout();
  res.cookie('token', '', {
    domain: (req.app.get('env') === 'local') ? 'localhost' : '.nobreaksguild.com',
    secure: true
  });

  res.redirect(conf.battlenet.redirectURL);
  //res.redirect(req.headers.referer);
}

module.exports = {
  authenticate: authenticate,
  logout: logout
};

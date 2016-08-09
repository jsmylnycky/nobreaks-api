'use strict';

let guildService = require('./service');

function getGuild(req, res, next) {
  if (!req.params.guildName) {
    return next({status: 400, message: 'No guild name present to perform query'});
  }

  guildService
    .getGuild(req.params.guildName)
    .then((guild) => {
      if(!guild) {
        return next({status: 400, message: `Unable to find guild: ${req.params.guildName}`});
      }

      req.guild = guild;
      return next();
    })
    .catch(next);
}

module.exports = {
  getGuild: getGuild
};

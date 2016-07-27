'use strict';

let Guild = require('./model');
let guildService = require('./service');

function createOrUpdateGuild(req, res) {
  let body = {
    realm: req.body.realm,
    battlegroup: req.body.battlegroup,
    level: req.body.level,
    side: req.body.side,
    achievementPoints: req.body.achievementPoints,
    emblem: {
      icon: req.body.emblem.icon,
      iconColor: req.body.emblem.iconColor,
      border: req.body.emblem.border,
      borderColor: req.body.emblem.borderColor,
      backgroundColor: req.body.emblem.backgroundColor
    }
  };

  guildService
    .createOrUpdateGuild(req.params.guildName || req.body.name, body)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).send(error);
    });
}

function getGuild(req, res) {
  guildService
    .getGuild(req.params.guildName)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).send(error);
    });
}

module.exports = {
  createOrUpdateGuild: createOrUpdateGuild,
  getGuild: getGuild
};

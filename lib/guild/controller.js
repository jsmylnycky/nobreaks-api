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

/* const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function findMembers(req, res, app) {
  let name = req.params.name;

  let query = (name) ? {name: { $regex: new RegExp(name, 'i') }} : {};

  Character.find(query, (err, users) => {
    if (err) {
      res.send(error);
    };

    users = _.sortBy(users, 'name', (o) => {
      return Math.floor(o.rank / 10);
    });

    res.send(users);
  });
};


function newsController(req, res) {
  let query = {
    fields: 'news',
    locale: 'en_US'
  };

  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
		  res.send(json.news);
    }, (error) => {
      res.send(error);
    });
};

module.exports = {
  members: members,
  news: newsController
};
*/

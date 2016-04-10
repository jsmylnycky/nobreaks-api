'use strict';

let app = require('../../index');
let Character = require('../character/model');
let helpers = require('../helpers');
let fetch = require('node-fetch');
let Promise = require('es6-promise').Promise;
let _ = require('lodash');

const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function members(req, res, app) {
  let name = req.params.name;

  let query = (name) ? {name: { $regex: new RegExp(name, 'i') }} : {};

  Character.find(query, (err, users) => {
    if (err) {
      res.send(error);
    };

    users = _.sortBy(users, 'name', (o) => {
      return Math,floor(o.rank / 10);
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

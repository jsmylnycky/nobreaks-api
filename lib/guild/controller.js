'use strict';

let conf = require('../../nobreaks.conf.json');
let helpers = require('../helpers');
let fetch = require('node-fetch');

const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function buildGetUrl(path, params) {
  return conf.battlenet.host + path + '?' +
    helpers.objectToQueryString(Object.assign({}, params || {}, {apikey: conf.battlenet.key}));
}

function membersController(req, res) {
  let query = {
    fields: 'members',
    locale: 'en_US'
  };

  fetch(buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
		  res.send(json.members);
  	}, (error) => {
      res.send(error);
    });
};

module.exports = {
  members: membersController
};

'use strict';

let characterService = require('./service');

function getCharacters(req, res) {
  characterService
    .getCharacters(req.params.guildName, req.params.characterName)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).send(error);
    });
};

module.exports = {
  getCharacters: getCharacters
};

/*
let helpers = require('../helpers');
let fetch = require('node-fetch');

const CHARACTER_API_PATH = '/wow/character';

function items(req, res) {
  let name = req.params.name;
  let realm = req.params.realm;

  let query = {
    locale: 'en_US',
    fields: items
  };

  fetch(helpers.buildGetUrl(CHARACTER_API_PATH + '/' + realm + '/' + encodeURIComponent(name), query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
		  res.send(json);
  	}, (error) => {
      res.send(error);
    });
};

function profile(req, res) {
  let name = req.params.name;
  let realm = req.params.realm;

  let query = {
    locale: 'en_US'
  };

  fetch(helpers.buildGetUrl(CHARACTER_API_PATH + '/' + realm + '/' + encodeURIComponent(name), query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
		  res.send(json);
  	}, (error) => {
      res.send(error);
    });
};

module.exports = {
  items: items,
  profile: profile
};
*/

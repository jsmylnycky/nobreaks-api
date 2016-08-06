'use strict';

let characterService = require('./service');

function getCharacters(req, res) {
  characterService
    .getCharacters(req.params.guildName, req.params.characterName)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).json(error);
    });
};

function getRaiders(req, res) {
  characterService
    .getRaiders(req.params.guildName)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).json(error);
    });
};

module.exports = {
  getCharacters: getCharacters,
  getRaiders: getRaiders
};

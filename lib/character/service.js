'use strict';

let Character = require('./model');
let guildService = require('../guild/service');
let _ = require('lodash');

// Returns a promise resolving the requested guild characers
function getCharacters(guildName, characterName) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        let query = (characterName) ? {name: { $regex: new RegExp(characterName, 'i') }} : {};

        query.guildId = guild._id;

        Character.find(query, (err, users) => {
          if (err) {
            reject(error);
          };

          users = _.sortBy(users, 'name', (o) => {
            return Math.floor(o.rank / 10);
          });

          resolve(users);
        });
      });
  });
}

module.exports = {
  getCharacters: getCharacters
};

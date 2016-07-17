'use strict';

let Character = require('./model');
let guildService = require('../guild/service');
let _ = require('lodash');

function findOrCreateCharacter(guildName, characterName) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        let body = {
          guildId: guild._id
        };

        Character
           .findOneAndUpdate({name: characterName},
             body, {upsert: true})
           .exec()
           .then((response) => {
             resolve(response);
           }, (error) => {
             reject(error);
           });
      });
  });
}

// Returns a promise resolving the requested guild characers
function getCharacters(guildName, characterName) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        let query = (characterName) ? {name: { $regex: new RegExp('^' + characterName + '$', 'i') }} : {};

        query.guildId = guild._id;

        Character.find(query, (error, characters) => {
          if (error) {
            reject(error);
          };

          characters = _.sortBy(characters, 'name', (o) => {
            return Math.floor(o.rank / 10);
          });

          if(characters.length === 1) {
            resolve(characters[0]);
          }

          resolve(characters);
        });
      });
  });
}

module.exports = {
  findOrCreateCharacter: findOrCreateCharacter,
  getCharacters: getCharacters
};

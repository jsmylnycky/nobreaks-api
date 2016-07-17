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

        let query = (characterName) ? { name: { $regex: new RegExp('^' + characterName + '$', 'i') } } : { isDeleted: false };

        query.guildId = guild._id;

        Character
          .find(query)
          .exec()
          .then((characters) => {
            characters = _.sortBy(characters, 'name', (o) => {
              return Math.floor(o.rank / 10);
            });

            if(characters.length === 1) {
              resolve(characters[0]);
            }

            resolve(characters);
          }, (error) => {
            reject(error);
          });
      });
  });
}

// Returns a promise resolving the requested guild characers
function getRaiders(guildName) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        let query = {
          $and: [
            { rank: { $in: [0, 1, 4, 5] }},
            { isDeleted: false }
          ]
        };

        query.guildId = guild._id;

        Character
          .find(query)
          .exec()
          .then((characters) => {
            resolve(_.sortBy(characters, 'name', (o) => {
              return Math.floor(o.rank / 10);
            }));
          }, (error) => {
            reject(error);
          });
      });
  });
}

module.exports = {
  findOrCreateCharacter: findOrCreateCharacter,
  getCharacters: getCharacters,
  getRaiders: getRaiders
};

'use strict';

let Character = require('./model');
let guildService = require('../guild/service');
let _ = require('lodash');

function findOrCreateCharacter(guildId, characterName) {
  let body = {
    guildId: guildId
  };

  return Character
   .findOneAndUpdate({name: characterName},
     body, {upsert: true})
   .exec();
}

// Returns a promise resolving the requested guild characers
function getCharacters(guildId, characterName) {
  return new Promise((resolve, reject) => {
    let query = (characterName) ? { name: { $regex: new RegExp('^' + characterName + '$', 'i') } } : { isDeleted: false };

    query.guildId = guildId;

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
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

// Returns a promise resolving the requested guild characers
function getRaiders(guildId) {
  return new Promise((resolve, reject) => {
    let query = {
      $and: [
        { rank: { $in: [0, 1, 4, 5] }},
        { isDeleted: false }
      ]
    };

    query.guildId = guildId;

    Character
      .find(query)
      .exec()
      .then((characters) => {
        resolve(_.sortBy(characters, 'name', (o) => {
          return Math.floor(o.rank / 10);
        }));
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

module.exports = {
  findOrCreateCharacter: findOrCreateCharacter,
  getCharacters: getCharacters,
  getRaiders: getRaiders
};

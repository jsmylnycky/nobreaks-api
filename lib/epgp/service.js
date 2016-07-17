'use strict';

let EPGPArchive = require('./models/archive');
let EPGPCharacter = require('./models/character');
let characterService = require('../character/service');
let guildService = require('../guild/service');
let _ = require('lodash');
let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.ObjectId;

// Returns a promise resolving the archive request
function archiveEPGP(guildName, epgpData) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        var archive = new EPGPArchive({
          data: epgpData,
          guildId: guild._id
        });

        archive.save(function(err, archive) {
          if(err) {
            reject(err);
          }
          resolve(JSON.parse(archive.data));
        });
      });
  });
}

function bulkUpdateCharacters(epgpData) {
  return new Promise((resolve, reject) => {
    let charactersPromises = [];

    let epgpCharObjs = [];

    _.forEach(epgpData.roster, (member) => {
      let character = member[0].split('-')[0];

      let characterEPGP = {
        character: character,
        totalEarned: member[1],
        totalSpent: member[2]
      };

      charactersPromises.push(
        updateCharacter(epgpData.guild, character, characterEPGP)
      );
    });

    Promise.all(charactersPromises)
      .then((data) => {
        resolve(epgpData);
      }, (error) => {
        reject(error);
      });
  });
}

function getEPGP(guildName, characterName) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildName, characterName)
      .then((character) => {
        if(!character) {
          reject('Unable to find characterName: ' + character);
        }

        EPGPCharacter
          .find({characterId: character._id})
          .exec()
          .then((epgpData) => {
            resolve(epgpData);
          }, (error) => {
            reject(error);
          });
      }, (error) => {
        reject(error);
      });
  });
}

function getMembersEPGP(guildName) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildName)
      .then((character) => {

        EPGPCharacter
          .find()
          .populate({
            path: 'characterId',
            select: 'name rank thumbnail level gender race class items'
          })
          .exec()
          .then((epgpData) => {
            resolve(epgpData);
          }, (error) => {
            reject(error);
          });
      }, (error) => {
        reject(error);
      });
  });
}

function getRaidersEPGP(guildName) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildName)
      .then((character) => {

        EPGPCharacter
          .find({characterId: { $ne: null}})
          .populate({
            path: 'characterId',
            select: 'name rank thumbnail level gender race class items',
            match: {
              rank: { $in: [0, 1, 4, 5] }
            }
          })
          .exec()
          .then((epgpData) => {
            resolve(
              _.sortBy(
                _.filter(epgpData, (o) => { return o.characterId; }),
                function(item) {
                  return [item.characterId.name];
                }
              )
            );
          }, (error) => {
            reject(error);
          });
      }, (error) => {
        reject(error);
      });
  });
}

function updateCharacter(guildName, characterName, epgpData) {
  return new Promise((resolve, reject) => {
    characterService.findOrCreateCharacter(guildName, characterName)
      .then((character) => {

        EPGPCharacter
           .findOneAndUpdate({characterId: character._id}, epgpData, {upsert: true})
           .exec()
           .then((data) => {
             resolve(data);
           }, (error) => {
             reject(error);
           });
      });
  });
}

function updateGuildConfig(epgpData) {
  return new Promise((resolve, reject) => {
    resolve(epgpData);
  });
}

module.exports = {
  archiveEPGP: archiveEPGP,
  bulkUpdateCharacters: bulkUpdateCharacters,
  getEPGP: getEPGP,
  getMembersEPGP: getMembersEPGP,
  getRaidersEPGP: getRaidersEPGP,
  updateCharacter: updateCharacter,
  updateGuildConfig: updateGuildConfig
};
'use strict';

let EPGPCharacter = require('./models/character');
let EPGPItem = require('./models/item');
let EPGPRaid = require('./models/raid');
let characterService = require('../character/service');
let guildService = require('../guild/service');
let _ = require('lodash');
let ItemString = require('wow-itemstring');

function getEPGP(guildId, characterName) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildId, characterName)
      .then((character) => {
        if(!character) {
          reject({error: {message: `Unable to find character: ${character}`}});
        }

        EPGPCharacter
          .find({characterId: character._id})
          .exec()
          .then((epgpData) => {
            resolve(epgpData);
          }, (err) => {
            reject({error: {message: err}});
          });
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function getLoot(guildId, raidDate) {
  return new Promise((resolve, reject) => {
    let LATEST = 'latest';
    let populateItemPromises = [];
    let raids = [];
    let raidIndex = 0;

    getRaids(guildId)
      .then((raidData) => {
        let query = null;
        raids = raidData;

        if (raids.length === 0) {
          return reject({error: {message: 'No raids have been uploaded yet.'}});
        }

        let raidId = raids[0]._id;

        if (raidDate !== LATEST) {
          raidIndex = _.findIndex(raids, {raidDate: raidDate});

          if (raidIndex === -1) {
            return reject({error: {message: 'Unable to find loot for the requested raid.'}});
          }

          raidId = raids[raidIndex]._id;
        }

        return EPGPItem
          .find({raidId: raidId})
          .populate({
            path: 'characterId',
            select: 'name'
          })
          .populate({
            path: 'itemId',
            select: 'item' // 'name context level itemLevel stats quality icon isWeapon weaponInfo itemClass inventoryType'
          })
          .exec();
      }, (err) => {
        reject({error: {message: err}});
      })
      .then((items) => {
        if (raidIndex === -1) {
          return Promise.reject();
        }

        _.forEach(items, (item) => {

          populateItemPromises.push(
            new Promise((resolve, reject) => {
              new ItemString()
                .populate(item.itemId.item)
                .then((itemObj) => {

                  resolve({
                    characterId: item.characterId,
                    cost: item.cost,
                    raidId: item.raidId,
                    timestamp: item.timestamp,
                    itemId: {
                      itemClass: itemObj.getClass(),
                      context: itemObj.getContext(),
                      icon: itemObj.getIcon(),
                      id: itemObj.getId(),
                      inventoryType: itemObj.getInventoryType(),
                      isItemSet: itemObj.isItemSet(),
                      isWeapon: itemObj.isWeapon(),
                      itemLevel: itemObj.getItemLevel(),
                      itemSet: itemObj.getItemSet(),
                      itemString: itemObj._itemString,
                      level: itemObj.getLevel(),
                      name: itemObj.getName(),
                      quality: itemObj.getQuality(),
                      stats: itemObj.getStats(),
                      weaponInfo: itemObj.getWeaponInfo()
                    }
                  });
                }, (err) => {
                  reject({error: {message: err}});
                });
            })
          );
        });

        return Promise.all(populateItemPromises);
      }, (err) => {
        reject({error: {message: err}});
      })
      .then((items) => {
        if (raidIndex === -1) {
          reject({error: {message: 'Unable to determine raid index'}});
        }

        resolve({
          nextRaidDate: (raidIndex === 0) ? null : items.nextRaidDate = raids[raidIndex - 1].raidDate,
          prevRaidDate: (raidIndex === raids.length - 1) ? null : items.nextRaidDate = raids[raidIndex + 1].raidDate,
          raidDate: raids[raidIndex].raidDate,
          items: items
        });
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function getMembersEPGP(guildId) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildId)
      .then((character) => {

        return EPGPCharacter
          .find()
          .populate({
            path: 'characterId',
            select: 'name rank thumbnail level gender race class items'
          })
          .exec();
      }, (err) => {
        reject({error: {message: err}});
      })
      .then((epgpData) => {
        resolve(epgpData);
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function getRaid(guildName, raidDate) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject({error: {message: `Unable to find guild: ${guildName}`}});
        }

        return EPGPRaid
          .findOne({raidDate: raidDate})
          .exec();
      })
      .then((raid) => {
        resolve(raid);
      }, (err) => {
        reject({error: {message: err}});
      });
  });
};

function getRaids(guildId) {
  return EPGPRaid
          .find()
          .sort('-raidDate')
          .exec();
};

function getRaidersEPGP(guildId) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildId)
      .then((characters) => {

        return EPGPCharacter
          .find()
          .populate({
            path: 'characterId',
            select: 'name rank thumbnail level gender race class items spec',
            match: {
              rank: { $in: [0, 1, 4, 5] }
            }
          })
          .exec();
      }, (err) => {
        reject({error: {message: err}});
      })
      .then((epgpData) => {
        resolve(
          _.sortBy(
            _.filter(epgpData, (o) => { return o.characterId; }),
            function(item) {
              return [item.characterId.name];
            }
          )
        );
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function updateGuildConfig(epgpData) {
  return new Promise((resolve, reject) => {
    resolve(epgpData);
  });
}

module.exports = {
  getEPGP: getEPGP,
  getLoot: getLoot,
  getMembersEPGP: getMembersEPGP,
  getRaid: getRaid,
  getRaidersEPGP: getRaidersEPGP,
  updateGuildConfig: updateGuildConfig
};

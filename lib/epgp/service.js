'use strict';

let EPGPCharacter = require('./models/character');
let EPGPItem = require('./models/item');
let EPGPRaid = require('./models/raid');
let characterService = require('../character/service');
let guildService = require('../guild/service');
let itemService = require('../item/service');
let crypto = require('crypto');
let _ = require('lodash');
let mongoose = require('mongoose');
let ItemString = require('wow-itemstring');
let ObjectId = mongoose.Schema.ObjectId;
let EPGP_FILTER_CHARACTER_NAMES = require('./consts').EPGP_FILTER_CHARACTER_NAMES;

// Returns a promise resolving the raid request
function raidEPGP(guildName, epgpData, raidDate) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        let raid = new EPGPRaid({
          data: epgpData,
          raidDate: raidDate,
          guildId: guild._id
        });

        raid.save((error, item) => {
          if(error) {
            reject(error);
          }
          resolve(JSON.parse(raid.data));
        });
      });
  });
}

function bulkUpdateCharacters(epgpData) {
  return new Promise((resolve, reject) => {
    let charactersPromises = [];

    let epgpCharObjs = [];

    _.forEach(epgpData.roster, (member) => {
      if (!isValidCharacter(member[0])) {
        return;
      }

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

function getLoot(guildName, raidDate) {
  return new Promise((resolve, reject) => {
    let LATEST = 'latest';
    let populateItemPromises = [];
    let raids = [];
    let raidIndex = 0;

    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        return getRaids(guildName);
      }, (error) => {
        reject(error);
      })
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
      }, (error) => {
        reject(error);
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
                    cost: Math.abs(item.cost),
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
                }, (error) => {
                  reject(error);
                });
            })
          );
        });

        return Promise.all(populateItemPromises);
      }, (error) => {
        reject(error);
      })
      .then((items) => {
        if (raidIndex === -1) {
          return reject(false);
        }

        resolve({
          nextRaidDate: (raidIndex === 0) ? null : items.nextRaidDate = raids[raidIndex - 1].raidDate,
          prevRaidDate: (raidIndex === raids.length - 1) ? null : items.nextRaidDate = raids[raidIndex + 1].raidDate,
          raidDate: raids[raidIndex].raidDate,
          items: items
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

        return EPGPCharacter
          .find()
          .populate({
            path: 'characterId',
            select: 'name rank thumbnail level gender race class items'
          })
          .exec();
      }, (error) => {
        reject(error);
      })
      .then((epgpData) => {
        resolve(epgpData);
      }, (error) => {
        reject(error);
      });
  });
}

function getRaid(guildName, raidDate) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        return EPGPRaid
          .findOne({raidDate: raidDate})
          .exec();
      })
      .then((raid) => {
        resolve(raid);
      }, (error) => {
        reject(error);
      });
  });
};

function getRaids(guildName) {
  return new Promise((resolve, reject) => {
    guildService
      .getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        return EPGPRaid
          .find()
          .sort('-raidDate')
          .exec();
      })
      .then((raid) => {
        resolve(raid);
      }, (error) => {
        reject(error);
      });
  });
};

function getRaidersEPGP(guildName) {
  return new Promise((resolve, reject) => {
    characterService
      .getCharacters(guildName)
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
      }, (error) => {
        reject(error);
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
      }, (error) => {
        reject(error);
      });
  });
}

function isValidCharacter(epgpCharacter) {
  return (EPGP_FILTER_CHARACTER_NAMES.indexOf(epgpCharacter) === -1);
}

function updateCharacter(guildName, characterName, epgpData) {
  return new Promise((resolve, reject) => {
    characterService.findOrCreateCharacter(guildName, characterName)
      .then((character) => {
        return EPGPCharacter
         .findOneAndUpdate({characterId: character._id}, epgpData, {upsert: true})
         .exec();
      })
      .then((data) => {
        resolve(data);
      }, (error) => {
        reject(error);
      });
  });
}

function updateGuildConfig(epgpData) {
  return new Promise((resolve, reject) => {
    resolve(epgpData);
  });
}

function buildEPGPItemId(loot) {
  let hash = crypto.createHash('sha256');
  hash.update(loot.join(''));
  return hash.digest('hex');
}

function updateItems(epgpData, raidDate) {
  return new Promise((resolve, reject) => {
    let itemPromises = [];
    let characterPromises = [];
    let createEPGPItemPromises = [];
    let findEPGPItemPromises = [];
    let items = [];
    let characters = [];
    let raid = {};

    // Start by finding or creating all of the items to make sure
    // we have them available to work with
    _.forEach(epgpData.loot, (loot) => {
      if (!isValidCharacter(loot[1])) {
        return;
      }

      itemPromises.push(itemService.findOrCreateItem(loot[2]));
      characterPromises.push(characterService.getCharacters(epgpData.guild, loot[1].split('-')[0]));
    });

    Promise.all(itemPromises)
      .then((data) => {
        items = data;

        // Look up all characters in the guild
        return Promise.all(characterPromises);
      }, (error) => {
        reject(error);
      })
      .then((chars) => {
        characters = chars;

        // Get the current raid object
        return getRaid(epgpData.guild, raidDate);
      }, (error) => {
        reject(error);
      })
      .then((raidData) => {
        raid = raidData;

        _.forEach(epgpData.loot, (loot) => {
          findEPGPItemPromises.push(
            EPGPItem
              .findOne({
                id: buildEPGPItemId(loot)
              })
              .exec()
          );
        });

        return Promise.all(findEPGPItemPromises);
      }, (error) => {
        reject(error);
      })
      .then((data) => {

        _.forEach(epgpData.loot, (loot) => {
          let lootHash = buildEPGPItemId(loot);

          if (_.find(data, {id: lootHash}) || !isValidCharacter(loot[1])) {
            return;
          }

          let itemString = loot[2];
          let characterName = loot[1].split('-')[0];

          let item = _.find(items, {itemString: itemString});

          let character = _.find(characters, {name: characterName});

          let itemDetails = {
            id: lootHash,
            timestamp: loot[0],
            cost: loot[3],
            itemId: item._id,
            characterId: character._id,
            raidId: raid._id,
          };

          createEPGPItemPromises.push(
            new EPGPItem(itemDetails).save()
          );
        });

        return Promise.all(createEPGPItemPromises);
      }, (error) => {
        reject(error);
      })
      .then((data) => {
        resolve(epgpData);
      }, (error) => {
        reject(error);
      });
  });
};

module.exports = {
  raidEPGP: raidEPGP,
  bulkUpdateCharacters: bulkUpdateCharacters,
  getEPGP: getEPGP,
  getLoot: getLoot,
  getMembersEPGP: getMembersEPGP,
  getRaid: getRaid,
  getRaidersEPGP: getRaidersEPGP,
  updateCharacter: updateCharacter,
  updateGuildConfig: updateGuildConfig,
  updateItems: updateItems
};

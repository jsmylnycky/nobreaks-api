'use strict';

let EPGPCharacter = require('./models/character');
let EPGPItem = require('./models/item');
let EPGPImport = require('./models/import');
let EPGPRaid = require('./models/raid');
let characterService = require('../character/service');
let itemService = require('../item/service');
let _ = require('lodash');
let crypto = require('crypto');
let moment = require('moment-timezone');
let EPGP_FILTER_CHARACTER_NAMES = require('./consts').EPGP_FILTER_CHARACTER_NAMES;

function buildEPGPItemId(loot) {
  let hash = crypto.createHash('sha256');
  hash.update(`${moment.unix(loot[0]).utcOffset(-5).format('MM-DD-YYYY')}${loot[1]}${loot[2]}${loot[3]}`);
  return hash.digest('hex');
}

function importEPGP(guildId, epgpData) {
  return new Promise((resolve, reject) => {
    let jsonEPGP = {};

    try {
      jsonEPGP = JSON.parse(epgpData)
    } catch(err) {
      reject({error: {message: 'The EPGP data is incorrectly formatted.'}});
    }

    // Step 1: Create an EPGPImport item to store the history of this upload,
    // unique to the timestamp field of when the export was taken from game.
    EPGPImport
      .findOneAndUpdate(
        {
          timestamp: jsonEPGP.timestamp
        },
        {
          data: epgpData,
          timestamp: jsonEPGP.timestamp,
          guildId: guildId
        },
        {upsert: true}
      )
      .exec()
      .then((epgpImport) => {
        // Step 2: Loop through the items.  For each item:
        // Step 2a: Take the timestamp of the loot and convert it to the timezone of the server.
        // This timestamp will then be converted to MM-DD-YYYY in order to find its uniqueness
        // within a raid.
        // Step 2b: The character will be either found or created
        // Step 2c: The item will be either found or created
        // Step 2d: The guild will be either found or created, using 2a's timestamp conversion

        // Step 3: Look up to see if the epgp item already exists for the given character and raid,
        // and if not, then create it, otherwise leave it alone
        return jsonEPGP.loot.reduce((prev, loot) => {
          return prev.then(() => { return processLoot(guildId, loot); });
        }, Promise.resolve());
      }, (err) => {
        reject({status: 400, message: 'Failed to create EPGP Import'});
      })
      .then(() => {
        // Step 4: Update EPGP character entries
        return processRoster(guildId, jsonEPGP.roster);
      }, () => {
        reject({status: 400, message: 'Failed to process loot'});
      })
      .then(() => {
        resolve(true);
      }, () => {
        reject({status: 400, message: 'Failed to process roster'});
      });
  });
}

function isValidCharacter(epgpCharacter) {
  return (EPGP_FILTER_CHARACTER_NAMES.indexOf(epgpCharacter) === -1);
}

function processCharacter(guildId, characterName, epgpData) {
  return new Promise((resolve, reject) => {
    characterService.findOrCreateCharacter(guildId, characterName)
      .then((character) => {
        return EPGPCharacter
         .findOneAndUpdate({characterId: character._id}, epgpData, {upsert: true})
         .exec();
      })
      .then((data) => {
        resolve(data);
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function processLoot(guildId, loot) {
  return new Promise((resolve, reject) => {
    if (!isValidCharacter(loot[1])) {
      return resolve();
    }

    Promise.all([
      raidFindOrCreate(guildId, moment.unix(loot[0]).utcOffset(-5).format('MM-DD-YYYY')),
      characterService.getCharacters(guildId, loot[1].split('-')[0]),
      itemService.findOrCreateItem(loot[2])
    ])
    .then((data) => {
      return EPGPItem
        .findOneAndUpdate(
          {
            id: buildEPGPItemId(loot)
          },
          {
            id: buildEPGPItemId(loot),
            timestamp: loot[0],
            cost: loot[3],
            raidId: data[0]._id,
            characterId: data[1]._id,
            itemId: data[2]._id
          },
          {upsert: true}
        )
        .exec();
    }, (err) => {
      reject(err);
    })
    .then((epgpItem) => {
      resolve(epgpItem);
    }, (err) => {
      reject(err);
    });
  });
}

function processRoster(guildId, roster) {
  return new Promise((resolve, reject) => {
    let charactersPromises = [];

    _.forEach(roster, (member) => {
      if (!isValidCharacter(member[0])) {
        return;
      }

      let character = member[0].split('-')[0];

      let characterEPGP = {
        character: character,
        effortPoints: member[1],
        gearPoints: member[2]
      };

      charactersPromises.push(
        processCharacter(guildId, character, characterEPGP)
      );
    });

    Promise.all(charactersPromises)
      .then((data) => {
        resolve(data);
      }, (err) => {
        reject({error: {message: err}});
      });
  });
}

function raidFindOrCreate(guildId, raidDate) {
  return EPGPRaid
    .findOneAndUpdate(
      {
        raidDate: raidDate,
        guildId: guildId
      },
      {},
      {upsert: true, new: true}
    )
    .exec();
}

module.exports = {
  importEPGP: importEPGP
};

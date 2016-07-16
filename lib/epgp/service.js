'use strict';

let Archive = require('./models/archive');
let guildService = require('../guild/service');
let _ = require('lodash');

// Returns a promise resolving the archive request
function archiveEPGP(guildName, epgpData) {
  return new Promise((resolve, reject) => {
    guildService.getGuild(guildName)
      .then((guild) => {
        if(!guild) {
          reject('Unable to find guild: ' + guildName);
        }

        var archive = new Archive({
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

function updateCharacter(guildName, characterName, epgpData) {
  return new Promise((resolve, reject) => {
    characterService.get
  });
}

module.exports = {
  archiveEPGP: archiveEPGP
};

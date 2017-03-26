'use strict';

let app = require('../index');
let Character = require('../lib/character/model');
let helpers = require('../lib/helpers');
let fetch = require('node-fetch');
let moment = require('moment-timezone');
let guildService = require('../lib/guild/service');
let _ = require('lodash');

const GUILD_NAME = 'No Breaks';
const GUILD_REALM = 'Thrall';
const GUILD_API_PATH = '/wow/guild/' + encodeURIComponent(GUILD_REALM) + '/' + encodeURIComponent(GUILD_NAME);
const CHARACTER_API_PATH = '/wow/character';

function updateRoster() {
  let query = {
    fields: 'members',
    locale: 'en_US'
  };

  let guildMembers = [];
  let guildId = null;

  // Begin by getting the list of members from the BNET API
  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
      guildMembers = json.members;
      console.log('Guild', GUILD_NAME, 'has', guildMembers.length, 'members');

      return guildService.getGuild(GUILD_NAME);
    }, (error) => {
      console.log('BNET Get Members Error', error);
    })
    .then((guild) => {
      guildId = guild._id;
      console.log('Guild ID for', GUILD_NAME, guildId);

      let idx = 1;
      let itemQuery = {
        locale: 'en_US',
        fields: 'items'
      };

      // Now we need to perform a chain lookup of item levels and add them to the characters
      // By using reduce in this pattern, we're able to do sequential promises
      // which lets us sleep between each one and not spam BNET and be flagged for malicious queries
      return new Promise((resolve, reject) => {
        guildMembers.reduce(function(curr, next) {
           return curr.then(function() {
             return new Promise((resolve, reject) => {
               fetch(
                 helpers.buildGetUrl(
                   `${CHARACTER_API_PATH}/${encodeURIComponent(next.character.realm || next.character.guildRealm || GUILD_REALM)}/${encodeURIComponent(next.character.name)}`,
                   itemQuery
                )
               )
                .then(helpers.parseFetchResponse)
                .then((character) => {

                  if(character.status && character.status === 'nok') {
                    console.log('Unable to find character %s, removing them from the guild list', next.character.name);

                    _.remove(guildMembers, function(o) {
                      return o.character.name === next.character.name;
                    });

                    resolve();
                  }

                  let lookupCharacter = _.find(guildMembers, function(o) {
                    return o.character.name === next.character.name;
                  });

                  if (lookupCharacter) {
                    console.log('[' + idx++ + '/' + guildMembers.length + '] Adding item level stats to', lookupCharacter.character.name);

                    lookupCharacter.character.items = {
                      averageItemLevel: character.items.averageItemLevel,
                      averageItemLevelEquipped: character.items.averageItemLevelEquipped
                    };
                  }

                  helpers.sleep(200);
                  resolve(next);
                }, (error) => {
                  console.log('BNET API Item Lookup Error', error);
                  reject(error);
                });
             });
           })
        }, Promise.resolve())
        .then((allDone) => {
          resolve(guildMembers);
        }, (error) => {
          reject(error);
        });
      });
    }, (error) => {
      console.log('API Get Guild Details Error', error);
    })
    .then((characters) => {
      console.log('Preparing to commit character updates to the database');

      return new Promise((resolve, reject) => {
        characters.reduce(function(curr, next) {
           return curr.then(function() {

             return new Promise((resolve, reject) => {
               let characterObj = {
                 name: next.character.name,
                 class: next.character.class,
                 race: next.character.race,
                 gender: next.character.gender,
                 level: next.character.level,
                 achievementPoints: next.character.achievementPoints,
                 thumbnail: next.character.thumbnail,
                 calcClass: next.character.calcClass,
                 spec: next.character.spec,
                 items: next.character.items,
                 rank: next.rank,
                 guildId: guildId,
                 isDeleted: false
               };

               console.log('Adding/Updating character', next.character.name);

               Character.findOneAndUpdate(
                 {
                   name: { $regex: new RegExp('^' + next.character.name + '$', 'i') }
                 },
                 characterObj,
                 {upsert: true})
               .exec()
               .then(() => {
                 resolve(next);
               }, (error) => {
                 reject(error);
               });
             });
           })
        }, Promise.resolve())
        .then((allDone) => {
          resolve(guildMembers);
        }, (error) => {
          reject(error);
        });
      });
    }, (error) => {
      console.log('Update Character Items Error', error);
      process.exit(-1);
    })
    .then(() => {
      console.log('Preparing to delete characters no longer in the guild');

      let deleteCounter = 0;

      return new Promise((resolve, reject) => {
        // Get all characters that are not currently deleted
        // and did not get updated
        Character.find(
          {
            $and: [
              { updatedAt: { $lt: moment().startOf('day') }},
              { isDeleted: false }
            ]
          }
        )
        .exec()
        .then((characters) => {
          return new Promise((resolve, reject) => {
            characters.reduce(function(curr, next) {
              return curr.then(function() {
                return new Promise((resolve, reject) => {
                  next.isDeleted = true;

                  console.log('Removing', next.name);

                  deleteCounter++;
                  next.save(function(error) {
                    if(error) {
                      reject(error);
                    }

                    resolve();
                  });
                })
              });
            }, Promise.resolve())
            .then(() => {
              resolve();
            }, (error) => {
              reject(error);
            });
          });
        })
        .then(() => {
          resolve(deleteCounter);
        }, (error) => {
          reject(error);
        });
      });
    }, (error) => {
      console.log('Save Characters Error', error);
      process.exit(-1);
    })
    .then((deleteCounter) => {
      console.log(deleteCounter);
      console.log('Removed', deleteCounter, 'characters');
      process.exit(0);
    }, (error) => {
      console.log('Remove Characters Error', error);
      process.exit(-1);
    });
}


updateRoster();

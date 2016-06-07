'use strict';

let app = require('../index');
let Character = require('../lib/character/model');
let helpers = require('../lib/helpers');
let fetch = require('node-fetch');
let moment = require('moment');
let Promise = require('es6-promise').Promise;
let _ = require('lodash');

const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function getMembers() {
  let query = {
    fields: 'members',
    locale: 'en_US'
  };

  let raiders = [];
  let members = [];

  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {

      json.members = json.members.filter((el) => {
        return el.rank === 0 || el.rank === 1 || el.rank === 4 || el.rank === 5;
      });

      let promises = [];

      _.forEach(json.members, (member) => {

        let promise = new Promise((resolve, reject) => {
          fetch('http://127.0.0.1:5002/v1/character/' + member.character.realm + '/' + encodeURIComponent(member.character.name) + '/items')
            .then(helpers.parseFetchResponse)
            .then((json) => {
              member.items = {
                averageItemLevel: json.items.averageItemLevel,
                averageItemLevelEquipped: json.items.averageItemLevelEquipped
              };
              resolve(member);
            }, (error) => {
              reject(error);
            });
        });

        promises.push(promise);
      });

      Promise.all(promises).then((members) => {
        let dbPromises = []

        // Update members
        _.forEach(members, (member, idx) => {
          let memberObj = {
            name: member.character.name,
            class: member.character.class,
            race: member.character.race,
            gender: member.character.gender,
            level: member.character.level,
            achievementPoints: member.character.achievementPoints,
            thumbnail: member.character.thumbnail,
            calcClass: member.character.calcClass,
            rank: member.rank,
            items: member.items
          };

          dbPromises.push(Character.findOneAndUpdate({name: member.character.name}, memberObj, {upsert: true}).exec());
        });

        Promise.all(dbPromises)
          .then(() => {
            // Remove members who did not get updated...this means they're no longer a raider
            Character.remove({'updatedAt': { $lt: moment().startOf('day') }})
              .exec((err, oldChars) => {
                if (err) { throw new Error(err); }

                process.exit(0);
              });

          }, (error) => {
            console.log(error);
            process.exit(-1);
          });

      }, (error) => {
        console.log(error);
        process.exit(-1);
      });
    }, (error) => {
      reject(error);
      process.exit(-1);
    });
}


getMembers();

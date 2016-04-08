'use strict';

let app = require('../index');
let Character = require('../lib/character/model');
let helpers = require('../lib/helpers');
let fetch = require('node-fetch');
let Promise = require('es6-promise').Promise;
let _ = require('lodash');

const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function sleep(milliseconds) {
  let start = new Date().getTime();
  for (let i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

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
      _.forEach(json.members, (member) => {

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
        };

        let promise = new Promise((resolve, reject) => {
          fetch('http://127.0.0.1:5000/v1/character/' + member.character.realm + '/' + encodeURIComponent(member.character.name) + '/items')
            .then(helpers.parseFetchResponse)
            .then((json) => {
              memberObj.items = {
                averageItemLevel: json.items.averageItemLevel,
                averageItemLevelEquipped: json.items.averageItemLevelEquipped
              };
              console.log(member);
              resolve(memberObj);
            }, (error) => {
              reject(error);
            });
        });

        promises.push(promise);

        sleep(100);
      });

      return Promise.all(promises);
    }, (error) => {
      reject(error);
    })
    .then((members) => {
      console.log(members);
      /*_.forEach(members, (member) => {
        console.log(member);
        /*Character.findOneAndUpdate({name: member.name}, member, {upsert: true}, (err, doc) => {
          if (err) { throw new Error(err); }

          console.log('Saved ', memberObj.name);
        });

      });*/
    }, (error) => {
      reject(error);
    });
}


getMembers();

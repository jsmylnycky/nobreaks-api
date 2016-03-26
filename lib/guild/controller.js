'use strict';

let app = require('../../index');
let helpers = require('../helpers');
let fetch = require('node-fetch');
let Promise = require('es6-promise').Promise;
let _ = require('lodash');

const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function members(req, res, app) {
  let query = {
    fields: 'members',
    locale: 'en_US'
  };

  let members = [];
  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
      members = json.members.splice(0,10);
      let promises = [];

      _.forEach(members, (member) => {
        let promise = new Promise((resolve, reject) => {
          fetch('http://127.0.0.1:5000/v1/character/' + member.character.realm + '/' + member.character.name + '/items')
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

      return Promise.all(promises);
  	}, (error) => {
      reject(error);
    })
    .then((json) => {
      res.send(json);
    }, (error) => {
      res.send(error);
    });
};

module.exports = {
  members: members
};

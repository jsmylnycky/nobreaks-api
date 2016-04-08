'use strict';

let app = require('../../index');
let Character = require('../character/model');
let helpers = require('../helpers');
let fetch = require('node-fetch');
let Promise = require('es6-promise').Promise;
let _ = require('lodash');

//const GUILD_API_PATH = '/wow/guild/Thrall/No%20Breaks';

function members(req, res, app) {
  let name = req.params.name;

  let query = (name) ? {name: { $regex: new RegExp(name, 'i') }} : {};

  Character.find(query, (err, users) => {
    if (err) {
      res.send(error);
    };

    console.log(users);

    res.send(users)
  });


/*  let query = {
    fields: 'members',
    locale: 'en_US'
  };

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  let raiders = [];
  let members = [];

  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {

      // limit results if need be..
      //members = json.members.splice(0,10);
      members = json.members;

      // replace with our new filtered array
        members = members.filter(function (el) {
          return el.rank == 0 || el.rank == 1 || el.rank == 4 || el.rank == 5 ;
        });

      let promises = [];

      _.forEach(members, (member) => {
        let promise = new Promise((resolve, reject) => {
          fetch('http://127.0.0.1:5000/v1/character/' + member.character.realm + '/' + encodeURIComponent(member.character.name) + '/items')
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
        // delay for 20 Milliseconds..
        sleep(100);
      });

      return Promise.all(promises);
  	}, (error) => {
      reject(error);
    })
    .then((json) => {
      res.send(json);
    }, (error) => {
      res.send(error);
    }); */
};


function newsController(req, res) {
  let query = {
    fields: 'news',
    locale: 'en_US'
  };

  fetch(helpers.buildGetUrl(GUILD_API_PATH, query))
  	.then(helpers.parseFetchResponse)
    .then((json) => {
		  res.send(json.news);
    }, (error) => {
      res.send(error);
    });
};

module.exports = {
  members: members,
  news: newsController
};

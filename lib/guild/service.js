'use strict';

let Guild = require('./model');
let Character = require('../character/model');
let _ = require('lodash');

// Returns a promise resolving the requested guild
function createOrUpdateGuild(guildName, body) {
   return Guild
          .findOneAndUpdate({name: { $regex: new RegExp(guildName, 'i') }},
            body, {upsert: true}).exec();
}
// Returns a promise resolving the requested guild details
function getGuild(guildName) {
   return Guild.findOne({name: { $regex: new RegExp(guildName, 'i') }}).exec();
}

module.exports = {
  createOrUpdateGuild: createOrUpdateGuild,
  getGuild: getGuild
};

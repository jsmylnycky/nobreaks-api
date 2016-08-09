'use strict';

let controller = require('./controller');
let helpers = require('../helpers');
let guildMW = require('../guild/middleware');

function epgpRoutes(router) {
  router.post('/guild/:guildName/epgp/upload', helpers.isAdminAuthenticated, guildMW.getGuild, controller.uploadEPGP);
  router.get('/guild/:guildName/members/:characterName/epgp',  controller.getEPGP);
  router.get('/guild/:guildName/epgp/members',  controller.getMembersEPGP);
  router.get('/guild/:guildName/epgp/raiders',  controller.getRaidersEPGP);
  router.get('/guild/:guildName/epgp/loot/:raidDate',  controller.getLoot);
};

module.exports = epgpRoutes;

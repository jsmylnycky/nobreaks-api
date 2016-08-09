'use strict';

let controller = require('./controller');
let helpers = require('../helpers');
let guildMW = require('../guild/middleware');

function epgpRoutes(router) {
  router.post('/guild/:guildName/epgp/upload', helpers.isAdminAuthenticated, guildMW.getGuild, controller.uploadEPGP);
  router.get('/guild/:guildName/members/:characterName/epgp',  guildMW.getGuild, controller.getEPGP);
  router.get('/guild/:guildName/epgp/members',  guildMW.getGuild, controller.getMembersEPGP);
  router.get('/guild/:guildName/epgp/raiders', guildMW.getGuild,  controller.getRaidersEPGP);
  router.get('/guild/:guildName/epgp/loot/:raidDate',  guildMW.getGuild, controller.getLoot);
};

module.exports = epgpRoutes;

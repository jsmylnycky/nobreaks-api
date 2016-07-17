'use strict';

let controller = require('./controller');
let helpers = require('../helpers');

function epgpRoutes(router) {
  router.post('/guild/:guildName/epgp/upload', helpers.isAdminAuthenticated, controller.uploadEPGP);
  router.get('/guild/:guildName/members/:characterName/epgp',  controller.getEPGP);
  router.get('/guild/:guildName/epgp/members',  controller.getMembersEPGP);
  router.get('/guild/:guildName/epgp/raiders',  controller.getRaidersEPGP);
};

module.exports = epgpRoutes;

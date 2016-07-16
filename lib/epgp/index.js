'use strict';

let controller = require('./controller');
let helpers = require('../helpers');

function epgpRoutes(router) {
  router.post('/guild/:guildName/epgp/upload', helpers.isAdminAuthenticated, controller.uploadEPGP);
};

module.exports = epgpRoutes;

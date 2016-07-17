'use strict';

let controller = require('./controller');
let helpers = require('../helpers');

function guildRoutes(router) {
  router.get('/guild/:guildName', controller.getGuild);
  router.post('/guild', helpers.isAdminAuthenticated, controller.createOrUpdateGuild);
  router.put('/guild/:guildName', helpers.isAdminAuthenticated, controller.createOrUpdateGuild);
  //router.get('/guild/news', controller.news);
};

module.exports = guildRoutes;

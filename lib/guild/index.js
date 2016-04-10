'use strict';

let controller = require('./controller');

function guildRoutes(router) {
  router.get('/guild/members', controller.members);
  router.get('/guild/members/:name', controller.members);
  router.get('/guild/news', controller.news);
};

module.exports = guildRoutes;

'use strict';

let controller = require('./controller');

function guildRoutes(router) {
  router.get('/guild/members', controller.members);
};

module.exports = guildRoutes;

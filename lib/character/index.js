'use strict';

let controller = require('./controller');

function characterRoutes(router) {
  //router.get('/character/:realm/:name', controller.profile);
  //router.get('/character/:realm/:name/items', controller.items);
  router.get('/guild/:guildName/members', controller.getCharacters);
  router.get('/guild/:guildName/raiders', controller.getRaiders);
  router.get('/guild/:guildName/members/:characterName', controller.getCharacters);
};

module.exports = characterRoutes;

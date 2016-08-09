'use strict';

let controller = require('./controller');
let guildMW = require('../guild/middleware');

function characterRoutes(router) {
  //router.get('/character/:realm/:name', controller.profile);
  //router.get('/character/:realm/:name/items', controller.items);
  router.get('/guild/:guildName/members', guildMW.getGuild, controller.getCharacters);
  router.get('/guild/:guildName/raiders', guildMW.getGuild, controller.getRaiders);
  router.get('/guild/:guildName/members/:characterName', guildMW.getGuild, controller.getCharacters);
};

module.exports = characterRoutes;

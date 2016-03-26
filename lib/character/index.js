'use strict';

let controller = require('./controller');

function characterRoutes(router) {
  router.get('/character/:realm/:name', controller.profile);
  router.get('/character/:realm/:name/items', controller.items);
};

module.exports = characterRoutes;

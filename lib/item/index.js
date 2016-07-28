'use strict';

let controller = require('./controller');

function itemRoutes(router) {
  router.get('/items/:itemString', controller.getItem);
};

module.exports = itemRoutes;

'use strict';

let itemService = require('./service');

function getItem(req, res) {
  itemService
    .findOrCreateItem(req.params.itemString)
    .then((item) => {
      res.send(item);
    }, (error) => {
      res.status(400).json(error);
    });
}

module.exports = {
  getItem: getItem
};

'use strict';

let conf = require('../../nobreaks.conf.json');
let Item = require('./model');
let ItemString = require('wow-itemstring');

function findOrCreateItem(itemString) {
  return new Promise((resolve, reject) => {
    getItem(itemString)
      .then((response) => {
        if (response) {
          return resolve(response);
        }

        return new ItemString(conf.battlenet.key, itemString).parse();
      }, (error) => {
        reject(error);
      })
      .then((itemParsed) => {
        Item.create({
          itemString: itemString,
          id: itemParsed.getId(),
          name: itemParsed.getName(),
          context: itemParsed.getContext(),
          level: itemParsed.getLevel(),
          itemLevel: itemParsed.getItemLevel(),
          stats: itemParsed.getStats(),
          _item: itemParsed
        }, (error, itemData) => {
          if(error) {
            reject(error);
          }

          itemData._item = null;
          resolve(itemData);
        });
      }, (error) => {
        reject(error);
      });
  });
}

function getItem(itemString) {
  return Item.findOne({itemString: itemString}).exec();
}

module.exports = {
  findOrCreateItem: findOrCreateItem,
  getItem: getItem
};

'use strict';

let conf = require('../../nobreaks.conf.json');
let itemStringParser = new (require('./parser/itemstring-parser'))(conf.battlenet.key);

function getItem(itemString) {
  return new Promise((resolve, reject) => {
    itemStringParser
      .parse(itemString)
      .then((item) => {
        console.log('itemStringParser', item);
        resolve(item);
      }, (error) => {
        console.log('itemStringParser error', error);
      });
  });
}

module.exports = {
  getItem: getItem
};

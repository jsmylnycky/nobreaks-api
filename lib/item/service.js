'use strict';

let conf = require('../../nobreaks.conf.json');
let Item = require('./model');
let ItemString = require('wow-itemstring');

function findOrCreateItem(itemString) {
  return new Promise((resolve, reject) => {
    getItem(itemString)
      .then((response) => {
        if (response) {
          // The item already exists
          return Promise.resolve(response);
        }

        // The item doesn't exist in our DB, so we call parse() in order to query the bnet api
        return new Promise((itemResolve, itemReject) => {
          new ItemString(conf.battlenet.key, itemString)
            .parse()
            .then((itemParsed) => {
              itemParsed._apiKey = null;

              Item.create({
                itemString: itemString,
                item: itemParsed
              }, (error, itemData) => {
                if(error) {
                  itemReject(error);
                }

                itemResolve(itemData);
              });
            }, (error) => {
              itemReject(error);
            });
        });
      }, (error) => {
        itemReject(error);
      })
      .then((itemParsed) => {
        resolve(itemParsed);
      }, (err) => {
        reject({error: {message: err}});
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

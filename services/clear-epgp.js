'use strict';

let app = require('../index');
let EPGPCharacters = require('../lib/epgp/models/character');
let EPGPItems = require('../lib/epgp/models/item');
let EPGPRaids = require('../lib/epgp/models/raid');


function clearEPGP() {
  EPGPItems.remove({}, (error) => {
    if (error) {
      console.log(error);
      return process.exit(-1);
    }

    console.log('Removed all EPGPItems');

    EPGPRaids.remove({}, (error) => {
      if (error) {
        console.log(error);
        return process.exit(-1);
      }

      console.log('Removed all EPGPRaids');

      EPGPCharacters.remove({}, (error) => {
        if (error) {
          console.log(error);
          return process.exit(-1);
        }

        console.log('Removed all EPGPCharacters');

        return process.exit(0);
      });
    });
  });
}

clearEPGP();

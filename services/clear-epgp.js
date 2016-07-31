'use strict';

let app = require('../index');
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

      return process.exit(0);
    });
  });
}

clearEPGP();

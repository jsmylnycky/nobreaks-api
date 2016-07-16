'use strict';

let epgpService = require('./service');

function uploadEPGP(req, res) {

  epgpService
    .archiveEPGP(req.params.guildName, req.body.epgpData)
    .then((response) => {
      res.send(response);
    }, (error) => {
      res.status(400).send(error);
    });
};

module.exports = {
  uploadEPGP: uploadEPGP
};

'use strict';

let epgpService = require('./service');

function getEPGP(req, res) {
  epgpService
    .getEPGP(req.params.guildName, req.params.characterName)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function getMembersEPGP(req, res) {
  epgpService
    .getMembersEPGP(req.params.guildName)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function getRaidersEPGP(req, res) {
  epgpService
    .getRaidersEPGP(req.params.guildName)
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
}

function uploadEPGP(req, res) {

  epgpService
    .archiveEPGP(req.params.guildName, req.body.epgpData, req.body.raidDate)
    .then((epgpData) => {
      return epgpService.updateGuildConfig(epgpData)
    }, (error) => {
      res.status(400).send(error);
    })
    .then((epgpData) => {
      return epgpService.bulkUpdateCharacters(epgpData)
    }, (error) => {
      res.status(400).send(error);
    })
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).send(error);
    });
};

module.exports = {
  getEPGP: getEPGP,
  getMembersEPGP: getMembersEPGP,
  getRaidersEPGP: getRaidersEPGP,
  uploadEPGP: uploadEPGP
};

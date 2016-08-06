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

function getLoot(req, res) {
  epgpService
    .getLoot(req.params.guildName, req.params.raidDate)
    .then((loot) => {
      res.send(loot);
    }, (error) => {
      res.status(400).send(error);
    })
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
    .raidEPGP(req.params.guildName, req.body.epgpData, req.body.raidDate)
    .then((epgpData) => {
      return epgpService.updateGuildConfig(epgpData);
    }, (error) => {
      console.log(error);
      res.status(400).json(error);
    })
    .then((epgpData) => {
      return epgpService.bulkUpdateCharacters(epgpData);
    }, (error) => {
      res.status(400).json(error);
    })
    .then((epgpData) => {
      return epgpService.updateItems(epgpData, req.body.raidDate);
    }, (error) => {
      res.status(400).json(error);
    })
    .then((epgpData) => {
      res.send(epgpData);
    }, (error) => {
      res.status(400).json(error);
    });
};

module.exports = {
  getEPGP: getEPGP,
  getLoot: getLoot,
  getMembersEPGP: getMembersEPGP,
  getRaidersEPGP: getRaidersEPGP,
  uploadEPGP: uploadEPGP
};

var express = require('express');
var router = express.Router();

const
  chatService = require('../server/chatService');

/* GET webhook auth. */
router.get('/', function(req, res, next) {
  if (chatService.authenticate(req)) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();

const userService = require('../server/userService');

/* GET webhook auth. */
router.get('/', function(req, res) {
  res.send(userService.getData())
});

module.exports = router;

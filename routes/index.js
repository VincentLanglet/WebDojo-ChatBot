const express = require('express');
const router  = express.Router();

/* GET hello world page. */
router.get('/', function(req, res) {
  res.render('index');
});

module.exports = router;

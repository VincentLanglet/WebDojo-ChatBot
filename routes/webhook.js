var express = require('express');
var router  = express.Router();

var config         = require('config');
var handlerService = require('../server/handlerService');

// Get the config var
var VALIDATION_TOKEN  = config.get('validationToken');

/* GET webhook auth. */
router.get('/', function(req, res) {
  console.log('Webhook get');

  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
});

/* POST route for receiving message */
router.post('/', function (req, res) {
  console.log('Webhook post');

  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          handlerService.handleMessage(entry, event);
        } else {
          console.log('Webhook received unknown event: ', event);
        }
      });
    });

    // You must send back a 200, within 20 seconds, to let us know you've successfully received the callback.
    // Otherwise, the request will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

module.exports = router;

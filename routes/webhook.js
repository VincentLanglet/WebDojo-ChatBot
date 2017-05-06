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

/* POST route for receiving message */
router.post('/', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          chatService.sendTextMessage(event.message);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });

    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

module.exports = router;

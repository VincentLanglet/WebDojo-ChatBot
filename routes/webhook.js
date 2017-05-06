var express = require('express');
var router = express.Router();

const
  chatService = require('../server/chatService');
  userService = require('../server/userService');

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
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          var senderId = event.sender.id;

          if (!userService.isUserKnown(senderId)) {
            userService.addUser(senderId, {
              id: senderId,
              createdAt: timeOfEvent
            });
            chatService.sendTextMessage(
              senderId,
              'Hello, my name is Shauny️️ nice to meet you !'
            );
          } else {
            var user = userService.getUser(senderId);

            chatService.receivedMessage(event);
          }
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

const config = require('config');
const request = require('request');

// Get the config const
const PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

function sendTextMessage(recipientId, messageText, next) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData, next);
}

function sendCarouselReply(recipientId, carousel, next) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: carousel
        }
      }
    }
  };

  callSendAPI(messageData, next);
}

function callSendAPI(messageData, next) {
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var recipientId = body.recipient_id;
        var messageId   = body.message_id;

        console.log('Successfully sent generic message with id %s to recipient %s', messageId, recipientId);
        next();
      } else {
        console.error('Unable to send message.');
        console.error(response);
        console.error(error);
      }
    }
  );
}

module.exports = {
  sendTextMessage: sendTextMessage,
  sendCarouselReply: sendCarouselReply
};

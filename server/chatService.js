var config  = require('config');
var request = require('request');

// Get the config var
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

/**
 * @param {int}    senderId
 * @param {object} message
 */
function handleChatCase(senderId, message) {
  console.log('Received message for user %d with message:', senderId);
  console.log(JSON.stringify(message));

  var messageText        = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    sendTextMessage(senderId, messageText);
  } else if (messageAttachments) {
    sendTextMessage(senderId, 'J\'ai bien reçu la pièce jointe');
  } else {
    sendTextMessage(senderId, 'Je n\'ai pas reçu de message')
  }
}

/**
 * @param {int}      recipientId
 * @param {string}   messageText
 * @param {function} next
 */
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

/**
 * @param {int}      recipientId
 * @param {array}    carousel
 * @param {function} next
 */
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

/**
 * @param {object}   messageData
 * @param {function} next
 */
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

        if (typeof next === 'function') {
          next();
        }
      } else {
        console.error('Unable to send message.');
        console.error(response);
        console.error(error);
      }
    }
  );
}

module.exports = {
  handleChatCase: handleChatCase,
  sendTextMessage: sendTextMessage,
  sendCarouselReply: sendCarouselReply
};

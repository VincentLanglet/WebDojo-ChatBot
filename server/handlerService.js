const chatService    = require('../server/chatService');
const weatherService = require('../server/weatherService');
const WeatherData    = require('../server/model/weatherData');
const userService    = require('../server/userService');
const parser         = require('json-parser');

const allStatus = ['chat', 'weather'];

function handleMessage(entry, event) {
  var senderId = event.sender.id;

  if (!userService.isUserKnown(senderId)) {
    handleFirstMessage(entry, event);
  } else {
    var user = userService.getUser(senderId);
    var message = event.message;

    if (allStatus.indexOf(message.text) !== -1) {
      userService.changeUserStatus(senderId, message.text);
    } else {
      switch (user.status) {
        case 'chat':
          handleChatCase(senderId, message);
          break;
        case 'weather':
          handleWeatherCase(senderId, message);
          break;
        default:
          chatService.sendTextMessage(senderId, 'Le status "' + user.status + '" est inconnu');
      }
    }
  }
}

function handleFirstMessage(entry, event) {
  var timeOfEvent = entry.time;
  var senderId = event.sender.id;

  userService.addUser(senderId, {
    id: senderId,
    createdAt: timeOfEvent,
    status: 'chat'
  });

  chatService.sendTextMessage(senderId, 'Bonjour');
  handleMessage(entry, event);
}

function handleChatCase(senderId, message) {
  console.log('Received message for user %d with message:', senderId);
  console.log(JSON.stringify(message));

  var messageText        = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    chatService.sendTextMessage(senderId, messageText);
  } else if (messageAttachments) {
    chatService.sendTextMessage(senderId, 'J\'ai bien reçu la pièce jointe');
  } else {
    chatService.sendTextMessage(senderId, 'Je n\'ai pas reçu de message')
  }
}

function handleWeatherCase(senderId, message) {
  weatherService.getGeolocalisation(message.text)
    .then(function (body) {
      var response = parser.parse(body).results;

      if (response.length <= 0) {
        chatService.sendTextMessage(senderId, 'Je ne connais pas de ville avec le nom "' + message.text + '"');
      } else {
        var location = response[0].geometry.location;

        chatService.sendTextMessage(senderId, 'Voici la météo pour la ville "' + message.text + '"');

        weatherService.getWeatherForecast(location.lat, location.lng)
          .then(function (body) {
            var weatherdata = new WeatherData(body);
            var carousel = [];

            weatherdata.forecast.forEach(function (forecast) {
              carousel.push(
                {
                  title: forecast.display_date,
                  subtitle: forecast.weather.description + '\n Max : ' + forecast.temp.max + '°C\n Min : ' + forecast.temp.min + '°C',
                  image_url: forecast.weather.image,
                  buttons: [{
                    type: "web_url",
                    url: "http://maps.google.com/maps?z=12&t=m&q=loc:" + location.lat + "+" + location.lng,
                    title: "Open Google Map"
                  }]
                }
              )
            });

            chatService.sendCarouselReply(senderId, carousel);
          })
          .catch(function (err) {
            console.log(err);
            chatService.sendTextMessage(senderId, 'Je n\'ai pas trouvé la météo de la ville "' + message.text + '"');
          })
      }
    })
    .catch(function (err) {
      console.log(err);
      chatService.sendTextMessage(senderId, 'Internal error');
    });
}

module.exports = {
  handleMessage: handleMessage
};

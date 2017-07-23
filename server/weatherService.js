const config  = require('config');
const request = require('request-promise');

const chatService    = require('../server/chatService');
const WeatherData    = require('../server/model/weatherData');
const parser         = require('json-parser');

// Get the config const
const GOOGLE_API_TOKEN  = config.get('googleApiToken');
const WEATHER_API_TOKEN = config.get('weatherApiToken');

function handleWeatherCase(senderId, message) {
  getGeolocalisation(message.text)
    .then(function (body) {
      var response = parser.parse(body).results;

      if (response.length <= 0) {
        chatService.sendTextMessage(senderId, 'Je ne connais pas de ville avec le nom "' + message.text + '"');
      } else {
        var location = response[0].geometry.location;

        chatService.sendTextMessage(senderId, 'Voici la météo pour la ville "' + message.text + '"');

        getWeatherForecast(location.lat, location.lng)
          .then(function (body) {
            var weatherdata = new WeatherData(body);
            var carousel = [];

            weatherdata.forecast.forEach(function (forecast) {
              carousel.push(
                {
                  title: forecast.display_date,
                  subtitle: forecast.weather.description
                    + '\n Max : '
                    + forecast.temp.max
                    + '°C\n Min : '
                    + forecast.temp.min
                    + '°C',
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
      chatService.sendTextMessage(senderId, 'Erreur interne');
    });
}

function getGeolocalisation(cityName) {
  return request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: GOOGLE_API_TOKEN,
      address: cityName
    },
    method: 'GET'
  });
}

function getWeatherForecast(lat, lng) {
  return request({
    uri: 'http://api.openweathermap.org/data/2.5/forecast/daily',
    qs: {
      APPID: WEATHER_API_TOKEN,
      lat: lat,
      lon: lng,
      cnt: 10
    },
    method: 'GET'
  });
}

module.exports =  {
  getGeolocalisation: getGeolocalisation,
  getWeatherForecast: getWeatherForecast,
  handleWeatherCase: handleWeatherCase
};

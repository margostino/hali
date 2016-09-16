var Q = require("q"),
    request = require('request'),
    utils = require('./utils'),
    app_cfg = require('../config/app');

var api_url = "http://"+app_cfg.api_host+":"+app_cfg.api_port;

const actions = {
  ping_story: (session, context) => {
    console.log('SUPERMAN VS BATMAN')
  },
  greeting: (session, context) => {
    return Q("Hola, que bueno encontrarte por aca. ¿como estás?");
  },
  greeting_how: (session, context) => {
    return Q("Estoy muy bien. Gracias!");
  },
  weather: (session, context) =>{
    var deferred = Q.defer();
    utils.getWeather(function(w){
      deferred.resolve(w);
    });
    return deferred.promise;
  },
  thanks: (session, context) =>{
    return Q("De nada!");
  },
  info_course: (session, context) =>{
    return Q("Cursas IA en aula 518 a las 19hs en Medrano.");
  },
  where_course: (session, context) =>{
    return Q("¿cuando?");
  },
  info_wifi: (session, context) =>{
    var deferred = Q.defer();
    request(api_url+"/has/wifi", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        deferred.resolve(JSON.parse(body).password);
      }
    });
    return deferred.promise;
  }
};

module.exports = actions;

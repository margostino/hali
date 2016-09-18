var Q = require("q"),
    request = require('request'),
    utils = require('./utils'),
    app_cfg = require('../config/app'),
    telegram = require('./telegram'),
    translate = require('./translate'),
    walpha = require('../src/walpha'),
    _ = require('underscore');

var api_url = "http://"+app_cfg.api_host+":"+app_cfg.api_port;

const actions = {
  ping_story: (session, context) => {
    console.log('SUPERMAN VS BATMAN')
  },
  greeting: (id) => {
    response = "Hola, que bueno encontrarte por aca. ¿como estás?";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  bye: (id) => {
    response = "Hasta pronto!";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  greeting_how: (id) => {
    response = "Estoy muy bien. Gracias!";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  weather: (id) =>{
    var deferred = Q.defer();
    utils.getWeather(function(response){
      telegram.sendMessage(id, response)
      console.log('SUPERMAN');
      deferred.resolve(response);
    });
    return deferred.promise;
  },
  thanks: (id) =>{
    response = "De nada!";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  info_course: (id) =>{
    response = "Cursas IA en aula 518 a las 19hs en Medrano.";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  where_course: (id) =>{
    response = "¿cuando?";
    telegram.sendMessage(id, response)
    return Q(response);
  },
  info_wifi: (id) =>{
    var deferred = Q.defer();
    request(api_url+"/has/wifi", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        response = JSON.parse(body).password;
        telegram.sendMessage(id, response)
        deferred.resolve(response);
      }
    });
    return deferred.promise;
  },
  ticket: (id, message) => {
      var deferred = Q.defer();
      var ticket_data = {
        "user": "legajoTIPO1110009",
        "subject": "Pedido de mantenimiento",
        "location": "Medrano",
        "description": message
      }

      request.post({
          json: true,
          body: ticket_data,
          url: api_url + "/has/tickets"
          }, function(error, response, body) {
        		if(error) {
        			deferred.reject('<ALUMNO> No pudo preguntar: ' + error);
              console.log("Error al enviar el ticket")
        		} else {
              var message_status = "Ticket enviado OK.";
              telegram.sendMessage(id, message_status);
              deferred.resolve(message_status);
        		}
  	  });
      return deferred.promise;
  },
  broadcast: (id, message) => {
    var name = '';
    var to_users = _.filter(app_cfg.users, function(e){return e.id!=id})
    //var to_users = app_cfg.users;

    var msg = message;
    if(name){
      msg = "El usuario " + name + " te envia el siguiente mensaje: ";
      msg += message;
    }
    telegram.sendBroadcast(to_users, msg, telegram.opts)
    var message_status = "Mensaje enviado OK. Remitente: " + name;
    message_status += ". Destinatarios: " + JSON.stringify(to_users);
    telegram.sendMessage(id, message_status);

    return Q(message_status);
  },
  walpha: (id, message) => {
    var deferred = Q.defer();
    walpha.query(message, function (err, result) {
      walpha.response(err, result)
        .then(function(response){
          telegram.sendMessage(id, response)
          deferred.resolve(response);
        })
    });
    return deferred.promise;
  },
  translate: (id, message) =>{
    var deferred = Q.defer();
    //Es flujo traductor
    translate.get(message)
        .then(function(response){
          telegram.sendMessage(id, response);
          deferred.resolve(response);
        })
        .fail(function(error){
          response = "No puedo traducir eso. Reformula por favor!";
          telegram.sendMessage(id, response)
          deferred.resolve(response);
        });

    return deferred.promise;
  }
};

module.exports = actions;

var ip = require('ip'),
  app_cfg = require('../config/app'),
  ctx_cfg = require('../config/ctx'),
  entity_cfg = require('../config/entity'),
  wit = require('./wit'),
  utils = require('./utils'),
  telegram = require('./telegram'),
  _ = require('underscore'),
  logger = require('./logger'),
  weather = require('weather-js'),
  isSEmoji = require('is-standard-emoji'),
  unicode = require("emoji-unicode-map"),
  emoji = require("emoji-dictionary"),
  google = require('google'),
  queue = require('queue'),
  redis_node = require("redis"),
  multiline = require('multiline'),
  botan = require('botanio')(app_cfg.token_botan),
  Q = require("q"),
  request = require('request');

var response = '';
var api_url = "http://"+app_cfg.api_host+":"+app_cfg.api_port;

if (app_cfg.cache_enable){
  var redis = redis_node.createClient();
  redis.flushall();
}

function processMerge(cb, id, username, context, entities, message){
  processMerge(cb, id, username, context, entities, message, null);
}

function isBroadcast(message){
  var prefix_control = "difundir:";
  if(message.substring(9,0).trim()==prefix_control)
    return true;
  else
    return false;
}

function isTicket(message){
  var prefix_control = "ticket:";
  if(message.substring(7,0).trim()==prefix_control)
    return true;
  else
    return false;
}

function processMerge(cb, id, username, context, entities, message, cached_msg){
  console.log(JSON.stringify(context));
    if(redis){
      console.log("Previous Context:  " + cached_msg);
      context = JSON.parse(cached_msg);
    }

    //Valida contextos configurados
    logger.session.info("<Pre> " + logger.genMerge(id, context));
    context = wit.validatePreContext(context);
    var current = wit.mergeEntities(entities);
    console.log("Current:  " + JSON.stringify(current));
    var pre = wit.mergePreContext(current, context);
    console.log("Merge PreContext:  " + JSON.stringify(pre));
    context = wit.updateContext(current, pre);

      if (_.contains(context, "who_iam") || _.contains(context, "start"))
        context.username = username;

      if (isBroadcast(message)){
        var msg_broadcast = username + " te envia el mensaje: " + message.substring(9).trim();
        context["msg_request"] = msg_broadcast;
        context.username = username;
        context.chatId = id;
      }else if (isTicket(message)){
        var msg_ticket = username + " envia el mensaje: " + message.substring(7).trim();
        context["msg_request"] = msg_ticket;
        context.username = username;
        context.chatId = id;
      }else
        context["msg_request"] = message;

    console.log("New Context:  " + JSON.stringify(context));
    console.log("Entities:  " + JSON.stringify(entities));
    logger.session.info("<New> " + logger.genMerge(id, context));

    //Proceso merge directo - evaluar por cambios en Wit.ai
    /*var context = wit.mergeEntities(entities);
    console.log("Current:  " + JSON.stringify(context));
    context["msg_request"] = message;*/

    if (redis)
      redis.set(id,JSON.stringify(context));

    cb(context);
}

const actions = {
  say(sessionId, context, message, cb) {
    response = message;
    cb();
  },
  merge(sessionId, context, entities, message, cb) {

    //console.log("actual: " + JSON.stringify(context));
    //console.log("actual message: " + JSON.stringify(message));

    //var chatId = utils.getChatId(sessionId)
    //var username = utils.getUsername(sessionId);
    var chatId = context.chatId;
    var username = context.username;

    //Obtengo el contexto anterior cacheado
    //Para un simple monitoreo durante el desarrollo
    if (redis)
      redis.get(chatId, function(err,value){
          processMerge(cb, chatId, username, context, entities, message, value);
      });
    else
      processMerge(cb, chatId, username, context, entities, message);

  },
  error(sessionId, context, error) {
    logger.error.error(error);
    console.log("Error: " + error);
  },
  send_ticket(sessionId, context, cb) {
    var chatId = context.chatId;

    var ticket_data = {
      "user": "legajoTIPO1110009",
      "subject": "Pedido de mantenimiento",
      "location": "Medrano",
      "description": "Esta inundado el baño del 3ro"
    }

    telegram.sendChatAction(chatId, "typing");
    request.post({
        json: true,
        body: ticket_data,
        url: api_url + "/has/tickets"
        }, function(error, response, body) {
          telegram.sendChatAction(chatId, "typing");
      		if(error) {
      			deferred.reject('<ALUMNO> No pudo preguntar: ' + error);
            console.log("Error al enviar el ticket")
      		} else {
            context.ticket_status = body.status;
            cb(context);
      		}
	  });

  },
  send_broadcast(sessionId, context, cb) {
    //var id = sessionId.split('==')[1];
    var id = context.chatId;
    var name = '';
    var to = [];
    var message = context["msg_request"];

    _.each(app_cfg.users, function(user){
        if(user.id==id)
          name = user.name;
        else
          to.push(user);
    });

    var msg = message;
    if(name){
      msg = "El usuario " + name + " te envia el siguiente mensaje: ";
      msg += message;
    }

    telegram.sendBroadcast(to, msg, telegram.opts);

    var message_status = "Mensaje enviado OK. Remitente: " + name;
    message_status += ". Destinatarios: " + JSON.stringify(to);
    context.message_status =  message_status;
    cb(context);
  },
  get_username(sessionId, context, cb) {
    context.username = context.username;
    cb(context);
  },
  get_wifi_password(sessionId, context, cb) {
    request(api_url+"/has/wifi", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        context.wifi_password = JSON.parse(body).password;
        cb(context);
      }
    });
  },
  get_books(sessionId, context, cb){
    context.books_list = "Los libros disponibles: William Stallings 5ta Edición, Abraham Silberschatz.";
    cb(context);
  },
  get_book_status(sessionId, context, cb) {
    context.book_status = "El libro esta disponible.";
    cb(context);
  },
  get_departamento(sessionId, context, cb) {
    context.oficina = "322";
    cb(context);
  },
  get_info_contact(sessionId, context, cb) {
    context.contact_info = "El mail es jperez@frba.utn.edu.ar";
    cb(context);
  },
  get_info_class(sessionId, context, cb) {
    context.class_info = "Cursas IA en aula 518 a las 19hs en Medrano.";
    cb(context);
  },
  get_info_exams(sessionId, context, cb) {
    context.exams_info = "Podes rendir en 2 de Diciembre a las 19hs Campus.";
    cb(context);
  },
  get_locations(sessionId, context, cb) {
    context.location_info = entity_cfg.LOCATIONS;
    cb(context);
  },
  ['get-availability'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.availability = 'El aula esta disponible :)';
    cb(context);
  },
  /*['fetch-departamento'](sessionId, context, cb) {
    context.oficina = '422';
    cb(context);
  },*/
  ['fetch-curso'](sessionId, context, cb) {
    context.aula = '615';
    cb(context);
  },
  ['get-aboutMe'](sessionId, context, cb) {
    context.about_me = entity_cfg.ABOUT_ME;
    cb(context);
  },
  ['get-skills'](sessionId, context, cb) {
    context.skills = entity_cfg.SKILLS;
    cb(context);
  },
  ['ping'](sessionId, context, cb) {
    context.response = "OK!";
    cb(context);
  },
  ['get-datetime'](sessionId, context, cb) {
    context.datetime = utils.now();
    cb(context);
  },
  ['google-it'](sessionId, context, cb){
    var list = context.msg_request.split(' ');
    var query = list.join('+');
    context.google_results = entity_cfg.GOOGLE_IT+query;
    cb(context);
  },
  ['get-weather'](sessionId, context, cb) {
    utils.getWeather(function(w){
      context.weather_today = w;
      cb(context);
    });
  },
  ['get-info-final'](sessionId, context, cb) {
    context.when_where_final = "Lunes 22 de Agosto. 19hs Medrano";
    cb(context);
  },
  ['get-wifi-password'](sessionId, context, cb) {
    context.wifi_password = "invit@do";
    cb(context);
  },
  ['start-auth'](sessionId, context, cb) {
      //Se recibe TOKEN de authenticación. Una opción es enviar el token al Sinap y validarlo
      //botan.track(msg, 'Start');
      var token = context['msg_request'].split(' ')[1];
      console.log(JSON.stringify(context));
      context.status = "Bienvenido " + context.username + " ¿en que puedo ayudarte?";
      cb(context);
  },
};

if (redis)
  redis.on("error", function (err) {
      console.log("Error Redis: " + err);
  });

/*redis.set("k1", "string val");
redis.hset("hash key", "hashtest 1", "some value", redis_node.print);
redis.hset(["hash key", "hashtest 2", "some other value"], redis_node.print);
redis.get("k1", function(err, reply) {
    // reply is null when the key is missing
    console.log(reply);
});*/

function sendMessage(chatId, message){
  var deferred = Q.defer();
  telegram.sendMessage(chatId,message)
          .then(function(res){
            deferred.resolve(message);
          });

  return deferred.promise;
}

function runWit(chatId, username, message){
  var deferred = Q.defer();
  message_sanitized = telegram.sanitizeMessage(message);
  if (message_sanitized){
    wit.runActions(actions, chatId, username, message_sanitized, function(error, context){
        if (error) {
          console.log('Oops! Got an error: ' + error);
          sendMessage(chatId, entity.NOT_STORY)
                  .then(deferred.reject);
        } else {
          sendMessage(chatId, response)
                  .then(deferred.resolve);
        }
    });
  }else{
    sendMessage(chatId, message)
      .then(deferred.resolve);
  }

  return deferred.promise;
}

function processMessage(id, username, msg){
  return processMessage(id, username, msg, null, null);
}

function processMessage(id, username, msg, cached_msg, cached_hash){
  var deferred = Q.defer();

  if(cached_msg){
      console.log('Response cached: ' + cached_msg);
      sendMessage(id, cached_msg)
        .then(deferred.resolve);
  }else{
    if(isSEmoji(msg)){
      //Si envia un emoji se responde lo mismo
      sendMessage(id, msg)
            .then(function(m){
              if (cached_hash) redis.set(cached_hash,m);
              deferred.resolve(m);
            });
    }else{
      //Ejecuto Wit.ai para obtener la respuesta de la historia
      runWit(id, username, msg)
        .then(function(m){
          if (cached_hash) redis.set(cached_hash,m);
          deferred.resolve(m);
        })
        .fail(deferred.reject);
    }
  }

  return deferred.promise;
}

function fn_bot (msg) {
  //console.log(JSON.stringify(msg));
  //console.log(("document" in msg)? true:false);

  var deferred = Q.defer();
  var chatId = msg.chat.id;
  var message = msg.text;
  var messageId = msg.message_id;
  var from = JSON.stringify(msg.from);

  console.log("Mensaje: " + message);
  console.log("Mensaje ID: " + messageId);
  console.log("From: " + from);
  console.log("Chat ID: " + chatId);

  var username = msg.from.first_name;

  logger.session.info(logger.genInitial({id:chatId, name:msg.from.first_name}, message));
  var message_hash = hash({chatId:chatId, session:wit.session, message:message}, app_cfg.hash);
  telegram.sendChatAction(chatId, "typing");

  if (app_cfg.cache_enable)
    redis.get(message_hash, function(error,value){
        processMessage(chatId, username, message, value, message_hash)
          .then(deferred.resolve)
          .fail(deferred.reject);
    });
  else {
    processMessage(chatId, username, message)
      .then(deferred.resolve)
      .fail(deferred.reject);
  }

  return deferred.promise;
};

exports.fn_bot = fn_bot;
// Any kind of message
exports.listen = telegram.on(fn_bot);

console.log("Server [" + ip.address() + "] listening...");
console.log("Session Wit: " + wit.session);

/*var fs = require('fs'),
    request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

download('https://api.telegram.org/file/bot219665776:AAEigXWrsa16CxeVqPWvhOoMolhUm7ADVyI/photo/file_2.jpg', 'file_2.png', function(){
  console.log('done');
});*/


//Enviar Broadcast
//telegram.sendBroadcast(app_cfg.users, entity_cfg.TESTME, telegram.opts);

//Cliente interactive por consola
//wit.interactive(actions);

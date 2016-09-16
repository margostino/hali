var ip = require('ip'),
  logger = require('./logger'),
  app_cfg = require('../config/app'),
  entity_cfg = require('../config/entity'),
  wit = require('./wit'),
  utils = require('./utils'),
  telegram = require('./telegram'),
  walpha = require('./walpha'),
  _ = require('underscore'),
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
  request = require('request'),
  readline = require('readline'),
  translate = require('./translate'),
  datetime = require('node-datetime');

var response = '';

if (app_cfg.cache_enable){
  var redis = redis_node.createClient();
  redis.flushall();
}

function setCache(id, message, data){
  if (redis){
    var data_hash = utils.generateHash(id, message);
    redis.set(data_hash, data);
  }
}

function sendMessage(chatId, message, options){
  var deferred = Q.defer();
  telegram.sendMessage(chatId, message, options)
          .then(function(res){
            deferred.resolve(message);
          });

  return deferred.promise;
}

function sendBroadcast(id, message) {
  var name = '';
  var to = [];

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

  sendMessage(id, message_status);
}


function processMerge(cb, id, username, context, entities, message){
  processMerge(cb, id, username, context, entities, message, null);
}

//ELIMINAR LO DE ABAJO
/*var context = ['greeting']

var diff = _.difference(['greeting'], ['greeting']);
//console.log(diff)


var story = wit.matchStory(context)
if(story)
  story.method().then(console.log);
else
  console.log('There is no story')

var e = {"intent":[{"confidence":1,"type":"value","value":"how"},{"confidence":1,"type":"value","value":"time"}]}
var ctx = {};
var keys = _.keys(e);
console.log(keys);
var ctx={};
  _.each(keys, function(entity){
      _.each(e[entity], function(values){
        if (entity=="intent")
          ctx[values.value] = values.value;
        else
          ctx[entity] = values.value;
      });
  });

console.log(ctx);*/
/*var pre=['find_course']
var ctx=['when']
console.log("validaaa");
pre.push(ctx)
var current = _.flatten(pre)
console.log(current);*/

//ELIMINAR LO DE ARRIBA

function processMerge(cb, id, username, context, entities, message, context_cached){
    //console.log(JSON.stringify(context));
    var story = {};
    var pre_context = [];

    //Asigno el contexto previo
    if(redis && context_cached)
      pre_context = JSON.parse(context_cached);

//inicio nuevo
    //Valida contextos configurados
    logger.session.info("<Pre> " + logger.genMerge(id, pre_context));
    logger.session.info("<Entities> " + logger.genMerge(id, entities));
    var current_context = _.keys(wit.mergeEntities(entities));
    logger.session.info("<Current> " + logger.genMerge(id, current_context));

    //Se mergea contexto previo con actual
    pre_context.push(current_context)
    var context_merged = _.flatten(pre_context)
    logger.session.info("<Merged> " + logger.genMerge(id, context_merged));

    /*
      Primero busca match de contexto actual.
      Si no tiene exito busca match con contexto previo mergeado
    */
    story = wit.matchStory(current_context)
    if(story){
      context = current_context;
      console.log("Evalua contexto actual.")
    }else{
      story = wit.matchStory(context_merged)
      context = context_merged;
      console.log("Evalua contexto mergeado.")
    }

    //Si hay story configurada ejecuto su method
    if(story)
      story.method()
        .then(function(response){
          logger.session.info("<Response> " + id+":"+response);
          sendMessage(id, response);
          //Se cachea la respuesta
          setCache(chatId, message, response);
        })
    else
      console.log('There is no story')

    //Se cachea el contexto para validar continuaciones en el flujo
    if (redis) redis.set(id,JSON.stringify(context));

    cb({});

//fin nuevo

    //Valida contextos configurados
    /*logger.session.info("<Pre> " + logger.genMerge(id, context));
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
    logger.session.info("<New> " + logger.genMerge(id, context));*/

    //TODO: desacomplar logica de contextos validados contra metodos mejorar
    // todos los flujos
    /*if ("when" in context && "day" in context && "what"){
      context["get_datetime"]="get_datetime";
      context["msg_request"] = message;
    }*/

    //Proceso merge directo - evaluar por cambios en Wit.ai
    /*var context = wit.mergeEntities(entities);
    console.log("Current:  " + JSON.stringify(context));
    context["msg_request"] = message;*/

}

const wit_actions = {
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
    console.log("Error Wit: " + error);
  },
  send_ticket(sessionId, context, cb) {
    var chatId = context.chatId;

    var ticket_data = {
      "user": "legajoTIPO1110009",
      "subject": "Pedido de mantenimiento",
      "location": "Medrano",
      "description": context['msg_request']
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
      context.status = entity_cfg.START;
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

function runWit(chatId, username, message){
  var deferred = Q.defer();

  wit.runActions(wit_actions, chatId, username, message, function(error, context){
        if (error) {
          console.log('Oops! Got an error: ' + error);
          logger.error.error(error);
          wit.restart(datetime.create(Date.now()), wit_actions);
          sendMessage(chatId, entity_cfg.NOT_WORKED)
                  .then(deferred.reject);
        } else {
          if(wit.isStart(context)){
            sendMessage(chatId, response, telegram.opts)
                    .then(deferred.resolve);
          }/*else
            sendMessage(chatId, response)
                  .then(deferred.resolve);*/
        }
    });

  return deferred.promise;
}

function processMessage(id, username, msg){
  return processMessage(id, username, msg, null, null);
}

function processMessage(id, username, message, cached_msg, cached_hash){
  var deferred = Q.defer();

  if(cached_msg){
      console.log('Response cached: ' + cached_msg);
      sendMessage(id, cached_msg)
        .then(deferred.resolve);
  }else{

    if(utils.isTagged('w:', message)){ //WAlpha
      message = message.substring(2).trim();
      walpha.query(message, function (err, result) {
        walpha.response(err, result)
          .then(function(res){
            setCache(id, message, res);
            sendMessage(chatId, res)
                  .then(deferred.resolve);
            })
          .fail(function(e){
            sendMessage(chatId, "No puedo responder a eso. Reformula por favor!")
                  .then(deferred.resolve);
            })
      });
    }else if(utils.isTagged('t:', message)){ //Translator
        //Es flujo traductor
        message = message.substring(2).trim();
        translate.get(message)
            .then(function(res){
              setCache(id, message, res);
              sendMessage(id, res)
                  .then(deferred.resolve);
                })
            .fail(function(e){
            sendMessage(id, "No puedo traducir eso. Reformula por favor!")
                  .then(deferred.resolve);
            })

    }else if(utils.isTagged('b:', message)){ //Broadcast
      var msg_broadcast = username + " te envia el mensaje: " + message.substring(2).trim();
      sendBroadcast(id,msg_broadcast);
    }else if(isSEmoji(message)){
      //Si envia un emoji se responde lo mismo
      sendMessage(id, message)
            .then(function(m){
              setCache(id, message, m);
              deferred.resolve(m);
            });
    }else{
      //Es un mensaje para Wit.ai
      //Valido mensajes que no tiene flujo Wit.ai
      var message_sanitized = telegram.sanitizeMessage(message);
      if (message_sanitized){
        //Ejecuto Wit.ai para obtener la respuesta de la historia
        runWit(id, username, message_sanitized)
          .then(function(response){
            if (cached_hash) redis.set(cached_hash,response);
            deferred.resolve(response);
          })
          .fail(deferred.reject);
      }else{
        //Como no pudo sanitazar mensaje envía lo mismo que recibió
        sendMessage(chatId, message)
          .then(deferred.resolve);
      }
    }
  }
  return deferred.promise;
}

function isAuthenticated(hash){
  var deferred = Q.defer();
  redis.get(hash, function(error,value){
      if(value){
        console.log('Autenticado!');
        deferred.resolve("authenticated");
      }else{
        console.log('No Autenticado!');
        deferred.reject("not authenticated");
      }
  });
  return deferred.promise;
}

function fn_bot (msg) {

  console.log(JSON.stringify(msg));
  //console.log(("document" in msg)? true:false);

  var deferred = Q.defer();
  var chatId = msg.chat.id;
  var messageId = msg.message_id;
  var from = JSON.stringify(msg.from);
  var username = msg.from.first_name;
  var authenticate = false;
  var start_hash = hash({chatId:chatId, start:"start"}, app_cfg.hash);
  var message = "";

  console.log("Mensaje ID: " + messageId);
  console.log("From: " + from);
  console.log("Chat ID: " + chatId);

  if(msg.text){
    //Envio texto para Wit.ai
    message = msg.text;
    console.log("Mensaje: " + message);
  }

  if(msg.contact){
    //Presiono el boton de autenticar
    console.log("Phone number:  " + msg.contact.phone_number);
    message = "Bienvenido " + username + " ¿en que puedo ayudarte?";
    authenticate = true;
    redis.set(start_hash, "OK");
  }

  logger.session.info(logger.genInitial({id:chatId, name:msg.from.first_name}, message));
  var message_hash = utils.generateHash(chatId, message);

  telegram.sendChatAction(chatId, "typing");

  //Verifica que este autenticado
  isAuthenticated(start_hash, message)
    .then(function(res){
      //Ya esta autenticado
      if (authenticate){
        var message = "Bienvenido " + username + " ¿en que puedo ayudarte?";

        var options ={
          reply_markup:{"keyboard":[["Hi!"]],"resize_keyboard": true,"one_time_keyboard":true}
        }
        sendMessage(chatId, message, options)
              .then(deferred.resolve);
      }else if (app_cfg.cache_enable){
        message = msg.text;
        redis.get(message_hash, function(error,value){
              processMessage(chatId, username, message, value, message_hash)
                .then(deferred.resolve)
                .fail(deferred.reject);
        });
      }else {
        //No esta habilitado Redis
        processMessage(chatId, username, message)
          .then(deferred.resolve)
          .fail(deferred.reject);
      }
    })
    .fail(function(e){
      //Pide autenticarse
      var message = entity_cfg.START;
      sendMessage(chatId, message, telegram.opts)
        .then(deferred.resolve);
    });
  return deferred.promise;
};

exports.fn_bot = fn_bot;
// Any kind of message
exports.listen = telegram.on(fn_bot);

console.log("Server [" + ip.address() + "] listening...");
console.log("Session Wit: " + wit.session);
/*var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();
console.log(lngDetector.detect('¿quien es Obama?'));*/


//var fs = require('fs');
//var obj = JSON.parse(fs.readFileSync('walpha_sample.json', 'utf8'));


//var reply_markup = telegram.ReplyKeyboardMarkup([[telegram.KeyboardButton('Share contact', request_contact=True)]])
//bot.sendMessage(CHAT_ID, 'Example', reply_markup=reply_markup)
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

var interactive = () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.setPrompt('> ');
  rl.prompt();
  rl.write(null, {ctrl: true, name: 'e'});
  rl.on('line', ((line) => {
    const msg = line.trim();
    var user = msg.split(',')[0].trim();
    var message = msg.split(',')[1].trim();
    telegram.sendMessage(user, message);
    rl.setPrompt('> ');
    rl.prompt();
  }).bind(this));
};
interactive();

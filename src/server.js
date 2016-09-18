/*var ip = require('ip'),
  logger = require('./logger'),
  app_cfg = require('../config/app'),
  entity_cfg = require('../config/entity'),
  utils = require('./utils'),
  wit = require('./wit'),
  actions = require('./actions'),
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
  botan = require('botanio')(_.app_cfg.token_botan),
  Q = require("q"),
  request = require('request'),
  readline = require('readline'),
  translate = require('./translate'),
  datetime = require('node-datetime');*/

var _ = require('../config/requires');

var response = '';

if (_.app_cfg.cache_enable){
  var redis = _.redis_node.createClient();
  redis.flushall();
}

function setCache(id, message, data){
  if (redis){
    var data_hash = _.utils.generateHash(id, message);
    redis.set(data_hash, data);
  }
}

/*function sendMessage(chatId, message, options){
  var deferred = _.Q.defer();
  _.telegram.sendMessage(chatId, message, options)
          .then(function(res){
            deferred.resolve(message);
          });
  return deferred.promise;
}*/

//ELIMINAR LO DE ABAJO
/*var context = ['greeting']

var diff = _.jsu.difference(['greeting'], ['greeting']);
//console.log(diff)


var story = _.wit.matchStory(context)
if(story)
  story.method().then(console.log);
else
  console.log('There is no story')

var e = {"intent":[{"confidence":1,"type":"value","value":"how"},{"confidence":1,"type":"value","value":"time"}]}
var ctx = {};
var keys = _.jsu.keys(e);
console.log(keys);
var ctx={};
  _.jsu.each(keys, function(entity){
      _.jsu.each(e[entity], function(values){
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
var current = _.jsu.flatten(pre)
console.log(current);*/

//ELIMINAR LO DE ARRIBA


function processWitMessage(cb, id, username, context, entities, message){
  processWitMessage(cb, id, username, context, entities, message, null);
}

function processWitMessage(cb, id, username, context, entities, message, context_cached){
    //console.log(JSON.stringify(context));
    var story = {};
    var pre_context = [];

    //Asigno el contexto previo
    if(redis && context_cached)
      pre_context = JSON.parse(context_cached);

//inicio nuevo
    //Valida contextos configurados
    _.logger.session.info("<Pre> " + _.logger.genMerge(id, pre_context));
    _.logger.session.info("<Entities> " + _.logger.genMerge(id, entities));
    var current_context = _.jsu.keys(_.wit.mergeEntities(entities));
    _.logger.session.info("<Current> " + _.logger.genMerge(id, current_context));

    //Se mergea contexto previo con actual
    pre_context.push(current_context)
    var context_merged = _.jsu.flatten(pre_context)
    _.logger.session.info("<Merged> " + _.logger.genMerge(id, context_merged));

    /*
      Primero busca match de contexto actual.
      Si no tiene exito busca match con contexto previo mergeado
    */
    story = _.wit.matchStory(current_context)
    if(story){
      context = current_context;
      console.log("Evalua contexto actual.")
    }else{
      story = _.wit.matchStory(context_merged)
      context = context_merged;
      console.log("Evalua contexto mergeado.")
    }

    //Se cachea el contexto para validar continuaciones en el flujo
    if (redis) redis.set(id,JSON.stringify(context));

    //Si hay story configurada ejecuto su method
    if(story)
      story.method(id)
        .then(function(response){
          _.logger.session.info("<Response> " + id+":"+response);
          cb({response: response});
        }).fail(function(error){
              //TODO: evaluar error de telegram en el envio
        })
    else{
      response = 'There is no story';
      console.log(response);
      cb({response: response});
    }

//fin nuevo

    //Valida contextos configurados
    /*_.logger.session.info("<Pre> " + _.logger.genMerge(id, context));
    context = _.wit.validatePreContext(context);
    var current = _.wit.mergeEntities(entities);
    console.log("Current:  " + JSON.stringify(current));
    var pre = _.wit.mergePreContext(current, context);
    console.log("Merge PreContext:  " + JSON.stringify(pre));
    context = _.wit.updateContext(current, pre);

      if (_.jsu.contains(context, "who_iam") || _.jsu.contains(context, "start"))
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
    _.logger.session.info("<New> " + _.logger.genMerge(id, context));*/

    //TODO: desacomplar logica de contextos validados contra metodos mejorar
    // todos los flujos
    /*if ("when" in context && "day" in context && "what"){
      context["get_datetime"]="get_datetime";
      context["msg_request"] = message;
    }*/

    //Proceso merge directo - evaluar por cambios en _.wit.ai
    /*var context = _.wit.mergeEntities(entities);
    console.log("Current:  " + JSON.stringify(context));
    context["msg_request"] = message;*/

}

const wit_actions = {
  say(sessionId, context, message, cb) {
    cb();
  },
  merge(sessionId, context, entities, message, cb) {

    //console.log("actual: " + JSON.stringify(context));
    //console.log("actual message: " + JSON.stringify(message));

    //var chatId = _.utils.getChatId(sessionId)
    //var username = _.utils.getUsername(sessionId);
    var chatId = context.chatId;
    var username = context.username;

    //Obtengo el contexto anterior cacheado
    //Para un simple monitoreo durante el desarrollo
    if (redis)
      redis.get(chatId, function(err,value){
          processWitMessage(cb, chatId, username, context, entities, message, value);
      });
    else
      processWitMessage(cb, chatId, username, context, entities, message);

  },
  error(sessionId, context, error) {
    _.logger.error.error(error);
    console.log("Error Wit: " + error);
  }/*,
  get_username(sessionId, context, cb) {
    context.username = context.username;
    cb(context);
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
    context.location_info = _.entity_cfg.LOCATIONS;
    cb(context);
  },
  ['get-availability'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.availability = 'El aula esta disponible :)';
    cb(context);
  },
  ['fetch-departamento'](sessionId, context, cb) {
    context.oficina = '422';
    cb(context);
  },
  ['fetch-curso'](sessionId, context, cb) {
    context.aula = '615';
    cb(context);
  },
  ['get-aboutMe'](sessionId, context, cb) {
    context.about_me = _.entity_cfg.ABOUT_ME;
    cb(context);
  },
  ['get-skills'](sessionId, context, cb) {
    context.skills = _.entity_cfg.SKILLS;
    cb(context);
  },
  ['ping'](sessionId, context, cb) {
    context.response = "OK!";
    cb(context);
  },
  ['get-datetime'](sessionId, context, cb) {
    context.datetime = _.utils.now();
    cb(context);
  },
  ['google-it'](sessionId, context, cb){
    var list = context.msg_request.split(' ');
    var query = list.join('+');
    context.google_results = _.entity_cfg.GOOGLE_IT+query;
    cb(context);
  },
  ['get-weather'](sessionId, context, cb) {
    _.utils.getWeather(function(w){
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
      context.status = _.entity_cfg.START;
      cb(context);
  }*/
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
  var deferred = _.Q.defer();

  _.wit.runActions(wit_actions, chatId, username, message, function(error, context){
        if (error) {
          console.log('Oops! Got an error: ' + error);
          _.logger.error.error(error);
          _.wit.restart(_.datetime.create(Date.now()), wit_actions);
          _.telegram.sendMessage(chatId, _.entity_cfg.NOT_WORKED)
                  .then(deferred.reject);
        } else {
          deferred.resolve(context);
          /*if(_.wit.isStart(context)){
            sendMessage(chatId, response, _.telegram.opts)
                    .then(deferred.resolve);
          }*/
        }
    });

  return deferred.promise;
}

function processTaggedMessage(id, username, message){
  var deferred = _.Q.defer();
  tag = _.utils.getTag(message);
  message = _.utils.getTaggedMessage(message);
  console.log('Verifica el tipo de mensaje que es...');
  switch (tag) {
    case 't':
      console.log('Es mensaje tipo tag traductor.');
      //Es flujo traductor
      _.actions.translate(id, message)
          .then(deferred.resolve);
      break;
    case 'w':
      console.log('Es mensaje tipo tag WAlpha.');
      //Es flujo WAlpha
      _.actions.walpha(id, message)
          .then(deferred.resolve);
      break;
    case 'b':
      console.log('Es mensaje tipo tag broadcast.');
      //Es flujo broadcast
      var msg_broadcast = username + " te envia el mensaje: " + message;
      _.actions.broadcast(id, msg_broadcast)
        .then(deferred.resolve);
      break;
  }

  return deferred.promise;
}

function processMessage(id, username, msg){
  return processMessage(id, username, msg, null, null);
}

function processMessage(id, username, message, response_cached, cached_hash){
  var deferred = _.Q.defer();
  message = message.toLowerCase();
  if(response_cached){
      //Respuesta cacheada
      console.log('Response cached: ' + response_cached);
      _.telegram.sendMessage(id, response_cached)
      deferred.resolve(response_cached);
  }else{
    if(_.utils.isTagged(message)){
      console.log('Procesa mensaje tageado...');
      //Es un mensaje tageado -> Busca su respuesta según corresponda
      processTaggedMessage(id, username, message)
        .then(function(response){
          deferred.resolve(response);
        });
    }else if(_.isSEmoji(message)){
      //Si envia un emoji se responde lo mismo
      _.telegram.sendMessage(id, message)
      deferred.resolve(message);
    }else{
      //Es un mensaje para _.wit.ai
      var message_sanitized = _.telegram.sanitizeMessage(message);
      if (message_sanitized){
        //Ejecuto _.wit.ai para obtener la respuesta de la historia
        runWit(id, username, message_sanitized)
          .then(function(context){
            deferred.resolve(context.response);
          })
          .fail(deferred.reject);
      }else{
        //Como no pudo sanitazar mensaje envía lo mismo que recibió
        _.telegram.sendMessage(id, message)
        deferred.resolve(message);
      }
    }
  }
  return deferred.promise;
}

function isAuthenticated(hash){
  var deferred = _.Q.defer();
  console.log('Verifica que este autenticado...');
  redis.get(hash, function(error,value){

      if (error) deferred.reject(error);

      if(value){
        console.log('Autenticado!');
        deferred.resolve(true);
      }else{
        console.log('No Autenticado!');
        deferred.resolve(false);
      }
  });
  return deferred.promise;
}

function fn_bot (msg) {

  console.log("Raw message: ");
  console.log(JSON.stringify(msg));
  //console.log(("document" in msg)? true:false);

  var deferred = _.Q.defer();
  var chatId = msg.chat.id;
  var messageId = msg.message_id;
  var from = JSON.stringify(msg.from);
  var username = msg.from.first_name;
  var authenticate = false;
  var start_hash = hash({chatId:chatId, start:"start"}, _.app_cfg.hash);
  var message = "";

  console.log("Mensaje ID: " + messageId);
  console.log("From: " + from);
  console.log("Chat ID: " + chatId);

  _.telegram.sendChatAction(chatId, "typing");

  if(msg.text){
    //Envio texto para _.wit.ai
    message = msg.text;
    console.log("Mensaje: " + message);

    //Verifica que este autenticado
    isAuthenticated(start_hash, message)
      .then(function(authenticate){
        //Ya esta autenticado
        if (authenticate){
          if (_.app_cfg.cache_enable){
            message = msg.text;
            _.logger.session.info(_.logger.genInitial({id:chatId, name:msg.from.first_name}, message));
            var message_hash = _.utils.generateHash(chatId, message);
            console.log('Busca mensaje en cache...');
            redis.get(message_hash, function(error,response){
                  processMessage(chatId, username, message, response, message_hash)
                    .then(function(response){
                      //Se cachea la respuesta
                      setCache(chatId, message, response);
                      deferred.resolve(response);
                    }).fail(deferred.reject);
            });
          }else {
            //No esta habilitado Redis
            processMessage(chatId, username, message)
            .then(function(response){
              //Se cachea la respuesta
              setCache(chatId, message, response);
              deferred.resolve(response);
            }).fail(deferred.reject);
          }
        }else{
          //Solicita autenticación
          console.log('Solicita autenticación...')
          var message = _.entity_cfg.START;
          _.telegram.sendMessage(chatId, message, _.telegram.opts)
            .then(deferred.resolve);
        }
      })
      .fail(function(error){
        //TODO: problema en redis de session
      });
  }else if(msg.contact){
    //Presiono el boton de autenticar
    //TODO: validar con API HAS
    console.log('Autenticación exitosa!');
    console.log("Phone number:  " + msg.contact.phone_number);
    message = "Bienvenido " + username + " ¿en que puedo ayudarte?";

    var options ={
      reply_markup:{"keyboard":[["Hi!"]],"resize_keyboard": true,"one_time_keyboard":true}
    }
    _.telegram.sendMessage(chatId, message, options)
          .then(deferred.resolve);

    redis.set(start_hash, "OK");
  }

  return deferred.promise;
};

exports.fn_bot = fn_bot;
// Any kind of message
exports.listen = _.telegram.on(fn_bot);

console.log("Server [" + _.ip.address() + "] listening...");
console.log("Session Wit: " + _.wit.session);
/*var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();
console.log(lngDetector.detect('¿quien es Obama?'));*/


//var fs = require('fs');
//var obj = JSON.parse(fs.readFileSync('walpha_sample.json', 'utf8'));


//var reply_markup = _.telegram.ReplyKeyboardMarkup([[_.telegram.KeyboardButton('Share contact', request_contact=True)]])
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

download('https://api._.telegram.org/file/bot219665776:AAEigXWrsa16CxeVqPWvhOoMolhUm7ADVyI/photo/file_2.jpg', 'file_2.png', function(){
  console.log('done');
});*/


//Enviar Broadcast
//_.telegram.sendBroadcast(_.app_cfg.users, _.entity_cfg.TESTME, _.telegram.opts);

//Cliente interactive por consola
//_.wit.interactive(actions);

var interactive = () => {
  rl = _.readline.createInterface({
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
    _.telegram.sendMessage(user, message);
    rl.setPrompt('> ');
    rl.prompt();
  }).bind(this));
};
interactive();

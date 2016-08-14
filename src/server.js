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
  Q = require("q");

var response = '';

if (app_cfg.cache_enable)
  var redis = redis_node.createClient();

function processMerge(cb, id, context, entities, message){
  processMerge(cb, id, context, entities, message, null);
}

function processMerge(cb, id, context, entities, message, cached_msg){

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
    var chatId = utils.getChatId(sessionId)
    //Obtengo el contexto anterior cacheado
    //Para un simple monitoreo durante el desarrollo
    if (redis)
      redis.get(chatId, function(err,value){
          processMerge(cb, chatId, context, entities, message, value);
      });
    else
      processMerge(cb, chatId, context, entities, message);

  },
  error(sessionId, context, error) {
    //telegram.sendMessage(utils.getChatId(sessionId),"algo no esta bien")
    console.log(error);
  },
  get_wifi_password(sessionId, context, cb) {
    context.wifi_password = "invit@do";
    cb(context);
  },
  get_departamento(sessionId, context, cb) {
    context.oficina = "322";
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
    context.skills = SKILLS;
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
      botan.track(msg, 'Start');
      var token = context['msg_request'].split(' ')[1];
      context.status = 'OK';
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

function runWit(chatId, message){
  var deferred = Q.defer();
  message_sanitized = telegram.sanitizeMessage(message);
  if (message_sanitized){
    wit.runActions(actions, chatId, message_sanitized, function(error, context){
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

function processMessage(id, msg){
  return processMessage(id, msg, null, null);
}

function processMessage(id, msg, cached_msg, cached_hash){
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
      runWit(id, msg)
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
  var deferred = Q.defer();
  var chatId = msg.chat.id;
  var message = msg.text;
  var messageId = msg.message_id;
  var from = JSON.stringify(msg.from);
  console.log("Mensaje: " + message);
  console.log("Mensaje ID: " + messageId);
  console.log("From: " + from);
  console.log("Chat ID: " + chatId);

  logger.session.info(logger.genInitial({id:chatId, name:msg.from.first_name}, message));
  var message_hash = hash({chatId:chatId, session:wit.session, message:message}, app_cfg.hash);
  telegram.sendChatAction(chatId, "typing");

  /*if (app_cfg.cache_enable)
    redis.get(message_hash, function(error,value){
        processMessage(chatId, message, value, message_hash)
          .then(deferred.resolve)
          .fail(deferred.reject);
    });
  else {
    processMessage(chatId, message)
      .then(deferred.resolve)
      .fail(deferred.reject);
  }*/

//Solo para el video
  switch(message.trim()) {
    case "Hola, como estás?":
    sendMessage(chatId, "Hola Juan, estoy muy bien y vos?").then(function(m){deferred.resolve(m);});break;
    case "Todo bien, quién sos?":
    sendMessage(chatId, "Soy Hali, tu asistente universitario. ¿en que puedo ayudarte?").then(function(m){deferred.resolve(m);});break;
    case "Cuando puedo rendir final de Inteligencia Artificial?":
    sendMessage(chatId, "Juan, tenés 2 fechas disponibles: 3 y 10 de Diciembre").then(function(m){deferred.resolve(m);});break;
    case "Ya puedo inscribirme?":
    sendMessage(chatId, "Si. ¿Queres que te inscriba yo?").then(function(m){deferred.resolve(m);});break;
    case "Si por favor!!!":
    sendMessage(chatId, "OK. Estas preparado para la primer fecha?").then(function(m){deferred.resolve(m);});break;
    case "mmm, si, voy a prepararme!!!":
    sendMessage(chatId, "Perfecto. Ya estas anotado. El comprobante te lo envié a tu email. Recordá que es a las 19hs en Campus").then(function(m){deferred.resolve(m);});break;
    case "Muchas Gracias":
    sendMessage(chatId, "De nada. Muchos Éxitos!!!").then(function(m){deferred.resolve(m);});break;
    case "En que aula es la clase de hoy?":
    sendMessage(chatId, "Hoy cursas Teoría de Control en el laboratorio Azul. El profe me pidió que les recuerde que tienen parcialito del último tema en clase.").then(function(m){deferred.resolve(m);});break;
    case "Que vieron la clase pasada?":
    sendMessage(chatId, "Vieron Régimen transitorio, estabilidad absoluta y relativa.").then(function(m){deferred.resolve(m);});break;
    case "Gracias por recordarme. Sabes cuándo es el primer parcial?":
    sendMessage(chatId, "El primer parcial es el 10 de Octubre. Y entran los temas hasta Control de Procesos Dinámicos.").then(function(m){deferred.resolve(m);});break;
    case "Ok. Que libros hay disponibles acerca de Teoría de Control?":
    sendMessage(chatId, "Un libro recomendado y muy pedido es Ingeniería de Control de Bolton. ¿Lo reservo?").then(function(m){deferred.resolve(m);});break;
    case "Si":
    sendMessage(chatId, "Reservado. Podés retirarlo hasta mañana a las 21hs. Luego quedará disponible para otros interesados").then(function(m){deferred.resolve(m);});break;
    case "Cómo hago para anotarme a PPS?":
    sendMessage(chatId, "Tenés que enviar por email el formulario 0 completo a pps@utn.edu.ar y presertarlo en la oficina 318 en Medrano. Los encontrás en: http://sistemas.utn.frba/pps").then(function(m){deferred.resolve(m);});break;
    case "Otra consulta, de que se trata la electiva de 5to llamada Arquitecturas Concurrentes?":
    var response = multiline(function(){/*
      Implementación de Arquitecturas de Software Concurrentes.
      Distintos modelos y tecnologías que nos ayudan a diseñar aplicaciones concurrentes sin utilizar locking.
      Paradigma de actores, mensajes asincrónicos, distribución, resiliencia, manejo de errores mediante jerarquías de supervisión, el teorema CAP.
      OPINION PERSONAL: MUUUUY INTERESANTE.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Hola Hali!":
    var response = multiline(function(){/*
      Hola Patricio! ¿en que puedo ayudarte?
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Podrías avisarle a mis alumnos que suspendo la clase de hoy?":
    var response = multiline(function(){/*
      Claro. Querés informar el motivo?
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Si, por supuesto. Estoy con un cuadro febril que me impide asistir":
    var response = multiline(function(){/*
      Muy bien Patricio. Ya estan todos informados. Espero que te mejores.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Gracias. Agregale al mensaje que recuerden que dentro de 2 semanas tienen el examen y entrega de TP":
    var response = multiline(function(){/*
      Ok. Ya les recorde a todos.
      Algunos alumnos quieren saber si en el parcial va a entrar el tema de Redes génicas.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Si comentales que el tema entra":
    var response = multiline(function(){/*
      Ok. Informado.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Me pasas el email de algún profesor de Inteligencia Artificial?":
    var response = multiline(function(){/*
      Si. Podés contactarte con Jose Perez a jperez@utn.frba.edu.ar.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "El aula Magna esta disponible esta semana a partir de las 19hs?":
    var response = multiline(function(){/*
      Está diponible el Jueves todo el día. ¿Querés reservarla?.
      Comentame el motivo que lo informo y te confirmo en menos de 6 horas.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Si por favor, reservala con motivo de una charla para alumnos acerca de nuevas arquitecturas genéticas":
    var response = multiline(function(){/*
      Excelente. Ya está informado. En breve te confirmo.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Muchas Gracias":
    var response = multiline(function(){/*
      De nada. Estoy para ayudar. Que tengas un buen día.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Hola Hali":
    var response = multiline(function(){/*
      Hola Andrés!, ¿como estás?.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Bien. Podrías informar a todos los alumnos de Medrano del día de la fecha que la facultad estará cerrada por problemas de energía?":
    var response = multiline(function(){/*
      Claro, ya estan todos informados.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Gracias Hali. Por otro lado recordales a todos los alumnos que el Sábado en Campus a las 10hs hay una charla de Big Data":
    var response = multiline(function(){/*
      Bien les informo. ¿Tienen que anotarse?
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Si. Podes anotarlos vos?":
    var response = multiline(function(){/*
      Por supuesto para eso estoy.
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Bien. Saludos Hali":
    var response = multiline(function(){/*
      Saludos Andrés!
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Hola que tal":
    var response = multiline(function(){/*
      Hola Maria, buen día. ¿En que puedo ayudarte?
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Queria saber si en la facu hay actualmente algún equipo de Investigación de Inteligencia Artificial":
    var response = multiline(function(){/*
      Maria, en este momento un grupo de egresados tiene la intención de armar un grupo. ¿te interesa?
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    case "Si, podrías pasarme algún contacto?":
    var response = multiline(function(){/*
      Si podes contactarte con Matias: mgarcia@gmail.com. Exitos!
    */});
    sendMessage(chatId, response).then(function(m){deferred.resolve(m);});break;
    }

  return deferred.promise;
};

exports.fn_bot = fn_bot;
// Any kind of message
exports.listen = telegram.on(fn_bot);

console.log("Server [" + ip.address() + "] listening...");
console.log("Session Wit: " + wit.session);

//Enviar Broadcast
/*telegram.sendBroadcast(app_cfg.users, entity_cfg.TESTME, telegram.opts);
  /*.then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      console.log('User is %s years old', message.text);
    });
});*/

//wit.interactive(actions);

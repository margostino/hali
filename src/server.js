var _ = require('../config/requires');

var response = '';
var lngDetector = new _.LanguageDetect();

if (_.app_cfg.cache_enable){
  var redis = _.redis_node.createClient();
  redis.flushall();
}

function setCache(id, message, data){
  if (redis && data){
    var data_hash = _.utils.generateHash(id, message);
    console.log('HASH SET: ' + data_hash)
    redis.set(data_hash, data);
  }
}

//Valida reglas para forzar Wit process
function forceWit(message){
  var force = false;
  switch (true) {
      case (message.trim()=='ping'):
        force = true;
        break;
    default:
        force = false;
        break;
  }

  if(force) console.log('Wit forced.')

  return force;
}

function isEnglish(message_lang){
  return (message_lang=='english')? true:false;
}

function detect_language(message){
  var lang_l1 = '';
  var langs_detected = lngDetector.detect(message);
  var langs_scores = _.jsu.filter(langs_detected, function(el){return (el[0]=="english" || el[0]=="spanish")});
  console.log('Lang Score: ' + JSON.stringify(langs_scores));
  if (langs_scores.length>0){
    lang_l1 = langs_scores[0][0]
    var score_l1 = langs_scores[0][1]
    var score_l2 = (langs_scores.length>1)? langs_scores[1][1]:0;
    var diff_scores = score_l1 - score_l2;
    _.logger.session.info("<Score Lang Detector> " + lang_l1 + "," + diff_scores);
  }
  return lang_l1;
}

function isStopWord(message){
  return _.jsu.contains(_.stopwords, message);
}

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
          //_.logger.session.info("<Response> " + id+":"+response);
          cb({response: response});
        }).fail(function(error){
              //TODO: evaluar error de telegram en el envio
        })
    else{
      console.log('There is no story');
      _.actions.not_story(id)
        .then(function(response){
          cb({response: response});
        });
    }
}

const wit_actions = {
  say(sessionId, context, message, cb) {
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
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
  ['ping'](sessionId, context, cb) {
    context.response = "OK!";
    cb(context);
  },
  ['google-it'](sessionId, context, cb){
    var list = context.msg_request.split(' ');
    var query = list.join('+');
    context.google_results = _.entity_cfg.GOOGLE_IT+query;
    cb(context);
  },
  ['get-info-final'](sessionId, context, cb) {
    context.when_where_final = "Lunes 22 de Agosto. 19hs Medrano";
    cb(context);
  }*/
};

function runWit(chatId, username, message){
  var deferred = _.Q.defer();

  _.wit.runActions(wit_actions, chatId, username, message, function(error, context){
        if (error) {
          console.log('Oops! Got an error: ' + error);
          _.logger.error.error(error);
          _.wit.restart(_.datetime.create(Date.now()), wit_actions);
          //Siempre responde. Modela una respuesta aún fallando
          _.telegram.sendMessage(chatId, _.entity_cfg.NOT_WORKED)
                  //.then(deferred.reject);
                  .then(deferred.resolve)
        } else {
          deferred.resolve(context);
        }
    });

  return deferred.promise;
}

function processTaggedMessage(id, username, message){
  console.log('Procesa mensaje tageado...');
  var deferred = _.Q.defer();
  tag = _.utils.getTag(message);
  message = _.utils.getTaggedMessage(message);
  console.log('Verifica el tipo de mensaje que es para tag: ' + tag);
  switch (tag) {
    case 't':
      console.log('Es mensaje tipo tag traductor.');
      //Es flujo traductor
      _.actions.translate(id, message)
          .then(function(response){
            deferred.resolve(response);
          });
      break;
    case 'w':
      console.log('Es mensaje tipo tag WAlpha.');
      //Es flujo WAlpha
      _.actions.walpha(id, message)
        .then(function(response){
          if(!response){
            response = entity_cfg.WALPHA_REFORM;
          }
          deferred.resolve(response);
        });
      break;
    case 'b':
      console.log('Es mensaje tipo tag broadcast.');
      //Es flujo broadcast
      var msg_broadcast = username + " te envia el mensaje: " + message;
      _.actions.broadcast(id, msg_broadcast)
        .then(function(response){
          deferred.resolve(response);
        });
      break;
    case 'm':
        console.log('Es mensaje tipo tag ticket.');
        //Es flujo ticket
        _.actions.ticket(id, message)
          .then(function(response){
            deferred.resolve(response);
          });
      break;
    default:
      response = 'Es mensaje tageado pero no es un tag valido.'
      _.telegram.sendMessage(id,'Es mensaje tageado pero no es un tag valido.')
      deferred.resolve(response);
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
    var message_lang = ''
    //Verify if it is stopword
    if (!isStopWord(message))
      message_lang = detect_language(message);

    if(_.utils.isTagged(message)){
      //Es un mensaje tageado -> Busca su respuesta según corresponda
      processTaggedMessage(id, username, message)
        .then(function(response){
          deferred.resolve(response);
        });
    }else if(_.isSEmoji(message)){
      //Si envia un emoji se responde lo mismo
      deferred.resolve(message);
    }else if(isEnglish(message_lang) && !forceWit(message)){
      console.log('Se detecto idioma INGLES.');
      console.log('Se taggea mensaje original para procesarlo como tipo WAlpha...');
      //Detecto ingles, entonces lo transforma en mensaje tageado WAlpha
      message = 'w:' + message;
      processTaggedMessage(id, username, message)
        .then(function(response){
          deferred.resolve(response);
        });
    }else{
      //Es un mensaje para WIT.ai
      console.log('Se detecto idioma ESPAÑOL: mensaje para Wit.ai');
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
  //var start_hash = hash({chatId:chatId, start:"start"}, _.app_cfg.hash);
  var start_hash = 'auth_'+chatId;
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
            console.log('HASH GET: ' + message_hash)
            console.log('Busca mensaje en cache...');
            redis.get(message_hash, function(error,response_cached){

                  if(response_cached)
                    _.botan.track(msg, 'msg_cached');
                  else
                    _.botan.track(msg, 'message');

                  processMessage(chatId, username, message, response_cached, message_hash)
                    .then(function(response){
                      if(!response_cached)
                        //Se cachea la respuesta, salvo que sea NOT_STORY
                        if(!_.utils.isNotStory(response))
                          setCache(chatId, message, response);

                      if (response)
                        _.logger.session.info("<Response> " + chatId+":"+response);

                      _.telegram.sendMessage(chatId, response);
                      deferred.resolve(response);
                    }).fail(deferred.reject);
            });
          }else {
            //No esta habilitado Redis
            processMessage(chatId, username, message)
            .then(function(response){
              //Se cachea la respuesta
              setCache(chatId, message, response);
              if (response)
                _.logger.session.info("<Response> " + chatId+":"+response);

              _.telegram.sendMessage(chatId, response);
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
    _.botan.track(msg, 'auth');
    //https://api.botan.io/track?token=B9qm3Cx-lA76u825_e9CVP5T5LVgzBCD&uid=211613276&name=auth
    //Consultar metricas en Botanio Telegram desde mobile
    //TODO: validar con API HAS
    console.log('Autenticación exitosa!');
    console.log("Phone number:  " + msg.contact.phone_number);
    message = "Bienvenido " + username + " ¿en que puedo ayudarte?";

    var options ={
      reply_markup:{"keyboard":[["Hi!"]],"resize_keyboard": true,"one_time_keyboard":true}
    }
    _.telegram.sendMessage(chatId, message, options)
          .then(deferred.resolve);

    console.log('HASH Authentication: ' + start_hash);
    redis.set(start_hash, "OK");
  }

  return deferred.promise;
};

//botan.track(msg, 'Start');
if (redis)
  redis.on("error", function (err) {
      console.log("Error Redis: " + err);
  });

exports.fn_bot = fn_bot;
// Any kind of message
exports.listen = _.telegram.on(fn_bot);

console.log("Server [" + _.ip.address() + "] listening...");
console.log("Session Wit: " + _.wit.session);

//Cliente interactive por consola
//Para uso de desarrollo: userid, Mensaje
//_.wit.interactive(actions);
// Interactive Zone (just for dev-enviroment)
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

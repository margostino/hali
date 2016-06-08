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
  redis = redis_node.createClient();

var response = '';

const actions = {
  say(sessionId, context, message, cb) {   
    response = message;    
    cb();
  },
  merge(sessionId, context, entities, message, cb) {      
    
    var chatId = utils.getChatId(sessionId)

    redis.get(chatId, function(err,value){
      if(value){
        console.log("Previous Context:  " + value); 
        context = JSON.parse(value);        
      }

      logger.session.info("<Pre> " + logger.genMerge(chatId, context));      
      context = wit.validatePreContext(context);  
      var current = wit.mergeEntities(entities);  
      console.log("Current:  " + JSON.stringify(current));
      var pre = wit.mergePreContext(current, context);    
      console.log("Merge PreContext:  " + JSON.stringify(pre));
      context = wit.updateContext(current, pre);
      context["msg_request"] = message; 
      console.log("New Context:  " + JSON.stringify(context));
      console.log("Entities:  " + JSON.stringify(entities));      
      logger.session.info("<New> " + logger.genMerge(chatId, context));              
      redis.set(chatId,JSON.stringify(context));  
      cb(context);      
    });
     
    
  },
  error(sessionId, context, error) {
    console.log(error.message);
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
    context.results = entity_cfg.GOOGLE_IT;
    cb(context);    
  },    
  ['get-weather'](sessionId, context, cb) {
    utils.getWeather(function(w){
      context.weather_today = w;
      cb(context);        
    });    
  },
  ['start-auth'](sessionId, context, cb) {
      var token = context['msg_request'].split(' ')[1];
      context.status = 'OK';
      cb(context);            
  },    
};

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

// Any kind of message
telegram.on(function (msg) {
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

  redis.get(message_hash, function(error,value){
      if(value){
          console.log('Response cached: ' + value);
          telegram.sendMessage(chatId,value);
      }else{
        if(isSEmoji(message)){
          telegram.sendMessage(chatId, message);
          redis.set(message_hash,message);
        }else{
          message_sanitized = telegram.sanitizeMessage(message);    
          if (message_sanitized)
            wit.runActions(actions, chatId, message_sanitized, function(error, context){
                if (error) {
                  console.log('Oops! Got an error: ' + error);
                  telegram.sendMessage(chatId, entity.NOT_STORY);  
                } else {
                  telegram.sendMessage(chatId, response);
                  redis.set(message_hash,response);
                }        
            });
          else{
            telegram.sendMessage(chatId, message);
            redis.set(message_hash,message);
          }
        }
      }
  });
});  

console.log("Server [" + ip.address() + "] listening...");
console.log("Session Wit: " + wit.session);

//telegram.sendBroadcast(app_cfg.users, entity_cfg.TESTME, telegram.opts);
  /*.then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      console.log('User is %s years old', message.text);
    });
});*/

//wit.interactive(actions);


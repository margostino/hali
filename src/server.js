var ip = require('ip'),
  app_cfg = require('../config/app'),
  ctx_cfg = require('../config/ctx'),
  entity_cfg = require('../config/entity'),
  wit = require('./wit'),
  utils = require('./utils'),
  telegram = require('./telegram'),
  _ = require('underscore'),  
  weather = require('weather-js'),
  isSEmoji = require('is-standard-emoji'),
  unicode = require("emoji-unicode-map"),
  emoji = require("emoji-dictionary"),  
  google = require('google');  

var response = '';

const actions = {
  say(sessionId, context, message, cb) {    
    response = message;    
    cb();
  },
  merge(sessionId, context, entities, message, cb) {  

    console.log("Previous Context:  " + JSON.stringify(context));
    //Validar pre-contexto con contextos posibles.
    context = wit.validatePreContext(context);    
    //Merge de entidades y contexto actual.
    var current = wit.mergeEntities(entities);
    //Merge pre-contexto con el contexto actual.  
    var pre = wit.mergePreContext(current, context); 

    console.log("Current:  " + JSON.stringify(current));
    console.log("Merge PreContext:  " + JSON.stringify(pre));
    //Actualizar contexto según match. 
    //Si contexto previo merge con actual match OK, entonces toma ese. Si no verifica match el actual.
    //Caso negativo es un contexto no entrenado 
    context = wit.updateContext(current, pre);
    context["msg_request"] = message; 
    console.log("New Context:  " + JSON.stringify(context));
    console.log("Entities:  " + JSON.stringify(entities));       
    cb(context);
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
    context.about_me = ABOUT_ME;
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
    context.results=GOOGLE_IT;
    cb(context);    
  },    
  ['get-weather'](sessionId, context, cb) {
    utils.getWeather(function(w){
      context.weather_today = w;
      cb(context);        
    });    
  },  
};

console.log("Server [" + ip.address() + "] listening...");
console.log("Session Wit: " + wit.session);

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
  
  if(isSEmoji(message))
    telegram.sendMessage(chatId, message);
  else{
    message_sanitized = telegram.sanitizeMessage(message);

    if (message_sanitized)
      wit.runActions(actions, chatId, message_sanitized, function(error, context){
          if (error) {
            console.log('Oops! Got an error: ' + error);          
            telegram.sendMessage(chatId, entity.NOT_STORY);  
          } else {
            telegram.sendMessage(chatId, response);
          }        
      });
    else
      telegram.sendMessage(chatId, message);

  }
});

//wit.interactive(actions);


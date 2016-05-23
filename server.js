var TelegramBot = require('node-telegram-bot-api'),
	ip = require('ip'),
  config = require('./config'),
  _ = require('underscore'),
  multiline = require('multiline'),
  writeFile = require('write'),
  log4js = require('log4js'),
  datetime = require('node-datetime'),
  weather = require('weather-js'),
  isEmoji = require('is-emoji-keyword'),
  isSEmoji = require('is-standard-emoji'),
  unicode = require("emoji-unicode-map"),
  emoji = require("emoji-dictionary"),
  convert = require('emojize').emojize,
  hash = require('object-hash'),
  should = require('should'),
  google = require('google'),
  random = require("random-js")(); // uses the nativeMath engine

//LOGGER
var logger = log4js.getLogger();
configureLogs(logger);
var logger = log4js.getLogger('hali');
logger.setLevel('INFO'); //TRACE, INFO, WARN, ERROR, FATAL, DEBUG

const Logger = require('node-wit').Logger;
const levels = require('node-wit').logLevels;
const Wit = require('node-wit').Wit;

const ABOUT_ME = multiline(function(){/*
Mi nombre es Hali!, la primer asistente de la UTN para personas de la UTN.
HALI proviene de Harry pero dicho por un Oriental. :) jaja.
Fui contruida por el Grupo de Proyecto Final G501 en el año 2016.
Mi mision es ayudarte en tu carrera en todo lo que este a mi alcance.
Para esto seria genial conocernos, y aprender mutuamente.
Cuanto más cuentes conmigo más voy a mejorar y aprender.
Muchas Gracias, y espero que esta relacion sea muy productiva para ambos.
Por cierto venis muy bien en la carrera! Vamos por más. :)

Me encuentro en estado de entrenamiento. En breve ya voy a ser más inteligente! :)
Cuando te recibas vamos a tomar unas cervezas!!!
*/});

const SKILLS = multiline(function(){/*
De momento estoy preparada para lo siguiente:
1) Contarte si el aula Magna esta disponible o no.
2) Contarte acerca de mi, mi historia.
3) Contarte donde esta tu departamento.
4) Saludarte.

Dia a dia voy a gregando nuevos skills.

Arriba esas palmas!! Clap clap!
*/});

const NOT_STORY = multiline(function(){/*
Estoy aprendiendo tu idioma aún. 
Algunas preguntas o comentarios no los entiendo todavia. 
En breve puedo responder ese mensaje.
*/});

const GOOGLE_IT = "https://www.google.com.ar/#q=";
const START = 'Bienvenido!';
const STOP = 'Hasta pronto!';
const TOKEN_TG = config.token_tg;
const TOKEN_WIT = config.token_wit;
const USER = config.user;

var session_wit = hash({
                        app:'hali',
                        env:'dev',
                        datetime:datetime.create(Date.now()),
                        random:random.integer(1, 9000)
                      });
var response = '';
const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const getIntentValue = (entities, value) => {
  val = null;    
  if (entities && entities["intent"] && 
      Array.isArray(entities["intent"]) &&
      entities["intent"].length > 0){

    var intent = _.findWhere(entities["intent"], {value:value});  
    if (!_.isUndefined(intent))
      val = intent.value;
  }

  //const val = firstEntityValue(entities, 'intent');
  //return val === value ? val : null;
  return val;
};

/*const updateContext = (context, entities, value) => {   
  const context_value = getIntentValue(entities, value);
  if (context_value)
      context[value] = context_value;      
  else
      delete context[value];

  return context;
};*/

var contexts = [
  ['bye'],['greeting'],['greeting','greeting_how'],
  ['thanks'],['weather'],['where'],['more_info'],['greeting_how'],
  ['hali_birth'],['hali_name'],['hali_lang'],['get_datetime'],
  ['hali_skills'],['hali_arq'],['hali_age'],['hali_private'],
  ['hali_sex'],['hali_color'],['sent_positivo','sent_negativo'],
  ['who'],['sent_negativo'],['sent_positivo'],['insulto'],
  ['aula','query_availability'],['search_departamento','where'],
  ['especialidad'],['hali_activity'],['about_it'],['google_it'],
  ['about_it','hali_activity'],['search_departamento', 'where','especialidad']
];

function matchContext(context, message){
  var current = _.keys(context);
  var hit = null;
  
  _.each(contexts, function(c){    
    var diff = _.difference(current, c);
    if (current.length==c.length && _.isEmpty(diff)){      
      hit = c;       
      return;
    }
  });
  
  if (!hit){
    context = {};
    context["not_story"] = NOT_STORY;
  }

  context["msg_request"] = message;  
  return context;
}

function updateContext(context, entities){  
  var keys = _.keys(entities);
  _.each(keys, function(entity){      
      _.each(entities[entity], function(values){          
        if (entity=="intent")
          context[values.value] = values.value;
        else
          context[entity] = values.value;          
      });
  });
  return context;  
}

/*function updatePreContext(context){
  _.each(_.keys(context), function(k){
    if (k!='msg_request')
      context[k] = pre_context[k];
  });
  
  return context;
}*/

const actions = {
  say(sessionId, context, message, cb) {    
    if (_.has(context, "not_story"))
        logger.info(context["msg_request"]);
    response = message;
    //console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {  

    /*context = updateContext(context, entities, "search_departamento");
    context = updateContext(context, entities, "who");
    context = updateContext(context, entities, "insulto");
    context = updateContext(context, entities, "greeting");        
    context = updateContext(context, entities, "greeting_how");    
    context = updateContext(context, entities, "sent_positivo");
    context = updateContext(context, entities, "sent_negativo");
    context = updateContext(context, entities, "aula");
    context = updateContext(context, entities, "query_availability");
    context = updateContext(context, entities, "hali_color");  
    context = updateContext(context, entities, "hali_sex");
    context = updateContext(context, entities, "hali_private");
    context = updateContext(context, entities, "hali_age");
    context = updateContext(context, entities, "hali_skills");
    context = updateContext(context, entities, "get_datetime");
    context = updateContext(context, entities, "hali_lang");
    context = updateContext(context, entities, "hali_name");
    context = updateContext(context, entities, "hali_birth");
    context = updateContext(context, entities, "more_info");
    context = updateContext(context, entities, "bye");
    context = updateContext(context, entities, "hali_home");
    context = updateContext(context, entities, "weather");
    context = updateContext(context, entities, "thanks");
    context = updateContext(context, entities, "emoji");*/

    console.log("Previous Context:  " + JSON.stringify(context));
    context = updateContext(context, entities);            
    context = matchContext(context, message);
    console.log("New Context:  " + JSON.stringify(context));
    console.log("Entities:  " + JSON.stringify(entities));    
    cb(context);
  },
  error(sessionId, context, error) {
    console.log('Not Story!');
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
    var dt = datetime.create(Date.now());
    var dt_formatted = dt.format('d f Y H:M:S');
    context.datetime = dt_formatted;
    cb(context);
  }, 
  ['google-it'](sessionId, context, cb){    
    context.results=GOOGLE_IT;
    cb(context);    
  },    
  ['get-weather'](sessionId, context, cb) {
    weather.find({search: 'Capital Federal, Buenos Aires', lang: 'es-ES', degreeType: 'C'}, function(err, result) {
      if(err) console.log(err);
     
      var temperature = "Actual: " + result[0].current.temperature + '°C';
      var skytext = "Cielo: " + result[0].current.skytext;
      var day = result[0].current.day;
      var forecast_day = _.where(result[0].forecast, {day:day});
      var high = "Max: " + forecast_day[0].high + '°C';
      var low = "Min: " + forecast_day[0].low + '°C';
      
      context.weather_today = temperature + "\r\n" + low + "\r\n" + high + "\r\n" + skytext     
      /*context.temperature = temperature;
      context.low = low;
      context.high = high;
      context.skytext = skytext;*/
      cb(context);
    });    
  },  
};

// Setup polling way
//var bot = new TelegramBot(TOKEN, {polling: true});
var bot = new TelegramBot(TOKEN_TG, {polling: {timeout: 1, interval: 100}});

var opts = {
  reply_markup: JSON.stringify(
    {
      force_reply: true
    }
  )};

console.log("Server [" + ip.address() + "] listening...");
console.log("Session: " + session_wit);

//const logger2 = new Logger(levels.DEBUG);
//const CLIENT = new Wit(TOKEN_WIT, actions, logger2);
const CLIENT = new Wit(TOKEN_WIT, actions);

var regEx = new RegExp('(<span class=\"emoji [_]([0-9]*[a-zA-Z]*[0-9]*)*\"><\/span>)*','g');
  
/*console.log(unicode.get(message));
console.log(isSEmoji(message));*/
//console.log(unicode.emoji);

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  var message = msg.text;
  var messageId = msg.message_id;
  var from = JSON.stringify(msg.from);
  console.log("Mensaje: " + message);
  console.log("Mensaje ID: " + messageId);
  console.log("From: " + from);
  console.log("Chat ID: " + chatId);
  
  if(isSEmoji(message))
    bot.sendMessage(chatId, message);
  else{
    message_sanitized = sanitizeMessage(message);

    if (message_sanitized)
      runActionsWit(chatId, message_sanitized);
    else
      bot.sendMessage(chatId, message);

  }
});

function sanitizeMessage(message){
  var message_sanitized = message;
  var message_converted = convert(message);
  var span = message_converted.match(regEx); 
  span = _.filter(span, function(e){return e!=''});
  if (span.length>0){              
      for (var i = 0; i<span.length; i++)                
        message_converted = message_converted.replace(span[i], "").trim();                                
      message_sanitized = message_converted;
  }  

  return message_sanitized;    
}

function runActionsWit(chatId, message){
  console.log("Ejecuta Wit.ai");
  CLIENT.runActions(session_wit, message, context, (error, context1) => {
        if (error) {
          console.log('Oops! Got an error: ' + error);          
          bot.sendMessage(chatId, NOT_STORY);  
        } else {
          bot.sendMessage(chatId, response);
        }
  });
}

function configureLogs(logger){
  
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file('logs/hali.log'), 'hali');

  log4js.configure({
    appenders: [
      { type: 'console' },
      { type: 'file', filename: 'logs/hali.log', category: 'hali' }
    ]
  });
}

CLIENT.interactive();


var TelegramBot = require('node-telegram-bot-api'),
	ip = require('ip'),
  config = require('./config'),
  _ = require('underscore'),
  multiline = require('multiline'),
  writeFile = require('write'),
  log4js = require('log4js'),
  datetime = require('node-datetime'),
  weather = require('weather-js'),
  jsStringEscape = require('js-string-escape'),
  encoding = require("encoding"),
  convertString = require("convert-string"),
  S = require('string');


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

const NOT_STORY = 'What?!!, Estoy en pleno entrenamiento de tu idioma!, banca un rato o enseñame!!!';
const START = 'Bienvenido!';
const STOP = 'Hasta pronto!';
const TOKEN_TG = config.token_tg;
const TOKEN_WIT = config.token_wit;
const USER = config.user;
const SESSION = 'hali-session_test';
const context = {};

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
  const val = firstEntityValue(entities, 'intent');
  return val === value ? val : null;
};

const updateContext = (context, entities, value) => {
  const context_value = getIntentValue(entities, value);
  if (context_value)
      context[value] = context_value;      
  else
      delete context[value];

  return context;
};


const actions = {
  say(sessionId, context, message, cb) {
    
    if (_.has(context, "not_story"))
        logger.info(context["msg_request"]);

    response = message;
    //console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {  
    const aula = firstEntityValue(entities, 'aula');
    if (aula)
      context.aula = aula;
    else
      delete context.aula;
    
    context = updateContext(context, entities, "search_departamento");
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
    context = updateContext(context, entities, "greeting_bye");
    context = updateContext(context, entities, "hali_home");
    context = updateContext(context, entities, "weather");
    context = updateContext(context, entities, "thanks");

    if (_.keys(context).length==0)
      context["not_story"] = NOT_STORY; 

    context["msg_request"] = message;
    console.log("context:  " + JSON.stringify(context));
    console.log("entities:  " + JSON.stringify(entities));

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
    var dt = datetime.create(Date.now());
    var dt_formatted = dt.format('d f Y H:M:S');
    context.datetime = dt_formatted;
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
//const logger = new Logger(levels.DEBUG);
//const CLIENT = new Wit(TOKEN_WIT, actions, logger);
const CLIENT = new Wit(TOKEN_WIT, actions);

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
  
  if (message == '/start')
    bot.sendMessage(chatId, START);
  else if (message == '/stop')
    bot.sendMessage(chatId, STOP);
  else
    CLIENT.runActions(SESSION, message, context, (error, context1) => {
    if (error) {
      console.log('Oops! Got an error: ' + error);
    } else {
      bot.sendMessage(chatId, response);
    }
  });
});

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
//CLIENT.interactive();
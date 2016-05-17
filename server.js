var TelegramBot = require('node-telegram-bot-api'),
	ip = require('ip'),
  config = require('./config'),
  _ = require('underscore'),
  multiline = require('multiline');

const Wit = require('node-wit').Wit;

const ABOUT_ME = multiline(function(){/*
Hola, ¿como estás?...
Mi nombre es Hali!, la primer asistente de la UTN para personas de la UTN.
Fui contruida por el Grupo de Proyecto Final G501 en el año 2016.
Mi mision es ayudarte en tu carrera en todo lo que este a mi alcance.
Para esto seria genial conocernos, y aprender mutuamente.
Cuanto más cuentes conmigo más voy a mejorar y aprender.
Muchas Gracias, y espero que esta relacion sea muy productiva para ambos.
Por cierto venis muy bien en la carrera! Vamos por más. :)

Me encuentro en estado de entrenamiento. En breve ya voy a ser más inteligente! :)
Cuando te recibas vamos a tomar unas cervezas!!!

*/});

const NOT_STORY = 'What?!!, Estoy en pleno entrenamiento de tu idioma!, banca un rato o enseñame!!!';
const TOKEN_TG = config.token_tg;
const TOKEN_WIT = config.token_wit;
const USER = config.user;

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
    response = message
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

    console.log("context:  " + JSON.stringify(context));
    console.log("entities:  " + JSON.stringify(entities));

    if (Object.keys(context).length>1)
      delete context["not_story"];
    else
      context["not_story"] = NOT_STORY;

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
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.oficina = '422';
    cb(context);
  },
  ['fetch-curso'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.aula = '615';
    cb(context);
  },
  ['get-aboutMe'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.about_me = ABOUT_ME;
    cb(context);
  },        
};

const session = 'hali-session';
const client = new Wit(TOKEN_WIT, actions);
const context = {};

/*client.message('hola', context, (error, data) => {
  if (error) {
    console.log('Oops! Got an error: ' + error);
  } else {
    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
  }
});*/

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

/*bot.sendMessage(USER, 'How old are you?', opts)
  .then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      console.log('User is %s years old', message.text);
    });
});*/

/*client.converse(session, "Hola", {}, (error, data) => {
    if (error) {
      console.log('Oops! Got an error: ' + error);
    } else {
      console.log('Yay, got Wit.ai response dTaaa: ' + JSON.stringify(data));
    }
   });*/

/*client.message('Hola', context, (error, data) => {
  if (error) {
    console.log('Oops! Got an error: ' + error);
  } else {
    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
  }
});*/

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  var text = msg.text;
  //console.log(msg);
  //bot.sendMessage(chatId, ABOUT_ME);

  client.runActions(session, text, context, (e, context1) => {
    if (e) {
      console.log('Oops! Got an error: ' + e);
      return;
    }    
    //console.log('The session state is now: ' + JSON.stringify(context1));
    bot.sendMessage(chatId, response);
  });



});
var TelegramBot = require('node-telegram-bot-api'),
	ip = require('ip'),
  config = require('./config'),
  multiline = require('multiline');

var about_me = multiline(function(){/*
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

var TOKEN = config.token;
var USER = config.user;

// Setup polling way
//var bot = new TelegramBot(TOKEN, {polling: true});
var bot = new TelegramBot(TOKEN, {polling: {timeout: 1, interval: 100}});

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

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  //console.log("Any kind of message");
  var chatId = msg.chat.id;
  //console.log(msg);
  bot.sendMessage(chatId, about_me);
});
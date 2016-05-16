var TelegramBot = require('node-telegram-bot-api'),
	ip = require('ip'),
  config = require('./config'); 

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


bot.sendMessage(USER, 'How old are you?', opts)
  .then(function (sended) {
    var chatId = sended.chat.id;
    var messageId = sended.message_id;
    bot.onReplyToMessage(chatId, messageId, function (message) {
      console.log('User is %s years old', message.text);
    });
});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  console.log(msg);
  bot.sendMessage(chatId, "Hola!!");
});
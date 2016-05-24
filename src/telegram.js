var TelegramBot = require('node-telegram-bot-api'),
	app_cfg = require('../config/app'),
	logger_wit = require('node-wit').Logger;
	levels = require('node-wit').logLevels;
	node_wit = require('node-wit').Wit,
	emojize = require('emojize');

/*var opts = {
  reply_markup: JSON.stringify(
    {
      force_reply: true
    }
)};*/
var regEx = new RegExp('(<span class=\"emoji [_]([0-9]*[a-zA-Z]*[0-9]*)*\"><\/span>)*','g');
const TOKEN = app_cfg.token_tg;
const bot = new TelegramBot(TOKEN, {polling: {timeout: 1, interval: 100}});
var telegram = {	
	on: (fn) => {
		return bot.on('message', fn);
	},
	sendMessage: (chatId, message) => {
		bot.sendMessage(chatId, message);
	},
	sanitizeMessage: (message) => {
	  var message_sanitized = message;
	  var message_converted = emojize(message);
	  var span = message_converted.match(regEx); 
	  span = _.filter(span, function(e){return e!=''});
	  if (span.length>0){              
	      for (var i = 0; i<span.length; i++)                
	        message_converted = message_converted.replace(span[i], "").trim();                                
	      message_sanitized = message_converted;
	  }  
	  return message_sanitized;    
	}
}

module.exports = telegram;

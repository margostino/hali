var TelegramBot = require('node-telegram-bot-api'),
	_ = require('underscore'),
	app_cfg = require('../config/app'),
	emojize = require('emojize').emojize;

/*var opts = {
  reply_markup: JSON.stringify(
    {
      force_reply: true
    }
)};*/
var regEx = new RegExp('(<span class=\"emoji [_]([0-9]*[a-zA-Z]*[0-9]*)*\"><\/span>)*','g');
const TOKEN = app_cfg.token_tg;
const bot = new TelegramBot(TOKEN, app_cfg.polling);

var telegram = {
	opts: {
		reply_markup:{
				keyboard:[[{
					text:'AUTENTICARME EN UTN (right now!)',
					request_contact: true
				}]],
				one_time_keyboard:true,
				request_location: true,
				resize_keyboard: true
			}
		/*reply_markup: JSON.stringify({
			keyboard: [
						[{
							text:'AUTENTICARME EN UTN (right now!)',
							resize_keyboard: true,
							//force_reply: true,
							//hide_keyboard: true,
							one_time_keyboard: true,
							request_contact: true,
							request_location: true
						}]
			]
		})*/
	},
	on: (fn) => {
		return bot.on('message', fn);
	},
	sendChatAction: (user, message) => {
		bot.sendChatAction(user, message);
	},
	sendBroadcast: (users, message) => {
		_.each(users, function(u){
			bot.sendMessage(u.id, message);
		});
	},
	sendMessage: (user, message, options) => {
		if(options)
			return bot.sendMessage(user, message, options);
		else
			return bot.sendMessage(user, message);
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

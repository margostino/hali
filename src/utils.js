var //ctx_cfg = require('../config/ctx'),
    app_cfg = require('../config/app'),
    wit = require('./wit'),
    _ = require('underscore'),
    weather = require('weather-js'),
    datetime = require('node-datetime'),
    story_cfg = require('../config/story');

const AREA = app_cfg.timezone.area;
const LANG = app_cfg.timezone.lang;
const DEGREE = app_cfg.timezone.degreeType;
const SYMBOL = app_cfg.timezone.degreeSymbol;

var utils = {
  now: () => {
    var dt = datetime.create(Date.now());
    return dt.format('d f Y H:M:S');
  },
  getWeather: (fn) => {
    weather.find({search: AREA, lang: LANG, degreeType: DEGREE}, function(err, result) {
      if(err) console.log(err);
        var temperature = "Actual: " + result[0].current.temperature + SYMBOL;
        var skytext = "Cielo: " + result[0].current.skytext;
        var day = result[0].current.day;
        var forecast_day = _.where(result[0].forecast, {day:day});
        var high = "Max: " + forecast_day[0].high + SYMBOL;
        var low = "Min: " + forecast_day[0].low + SYMBOL;

      fn(temperature + "\r\n" + low + "\r\n" + high + "\r\n" + skytext);
    });
  },
  getChatId: (session) => {
    var id = session.split('==')[1];
    if(id=='' || _.isUndefined(id))
        return 'test';
    else
        return id;
  },
  getUsername: (session) => {
    var username = session.split('==')[2];
    if(username=='' || _.isUndefined(username))
        return 'test';
    else
        return username;
  },
  isTagged: (prefix, message) => {
    if(message.toLowerCase().substring(2,0).trim()==prefix)
	    return true;
	  else
	    return false;
  },
  isValidTag: (tag) => {
    tags = story_cfg.tags;
    return _.contains(tags,tag);
  },
  generateHash: (id, data) =>{
    message_split = data.split(':')
    message_len = message_split.length
    if(message_len>1 && utils.isValidTag(message_split[0]))
      data = data.substring(message_split[0].length+1)

    return hash({chatId:id, session:wit.session, data:data}, app_cfg.hash);
  }
}

module.exports = utils;

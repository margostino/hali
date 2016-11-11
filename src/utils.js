var app_cfg = require('../config/app'),
    story_cfg = require('../config/story'),
    entity_cfg = require('../config/entity'),
    wit = require('./wit'),
    _ = require('underscore'),
    weather = require('weather-js'),
    datetime = require('node-datetime');

const AREA = app_cfg.timezone.area;
const LANG = app_cfg.timezone.lang;
const DEGREE = app_cfg.timezone.degreeType;
const SYMBOL = app_cfg.timezone.degreeSymbol;
const TAGS = app_cfg.tags;

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
  getTag: (message) => {
    message_split = message.split(':')
    message_len = message_split.length
    tag = message_split[0]

    //return (message_len>1 && utils.isValidTag(tag))? tag:'';
    return (message_len>1)? tag:'';
  },
  isTagged: (message) => {
    return (utils.getTag(message))? true:false;
  },
  isValidTag: (tag) => {
    return _.contains(TAGS,tag);
  },
  isNotStory: (response) => {
    return (response==entity_cfg.NOT_STORY)? true:false;
  },
  getTaggedMessage: (message) => {
    return message.substring(2).trim();
  },
  generateHash: (id, data) =>{
    /*message_split = data.split(':')
    message_len = message_split.length
    if(message_len>1 && utils.isValidTag(message_split[0]))
      data = data.substring(message_split[0].length+1)*/

    return hash({chatId:id, session:wit.session, data:data}, app_cfg.hash);
  }
}

module.exports = utils;

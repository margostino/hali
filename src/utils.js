var ctx_cfg = require('../config/ctx'),
    _ = require('underscore'),  
    weather = require('weather-js'),
    datetime = require('node-datetime');  

const AREA = ctx_cfg.weather.area;
const LANG = ctx_cfg.weather.lang;
const DEGREE = ctx_cfg.weather.degreeType;
const SYMBOL = ctx_cfg.weather.degreeSymbol;

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
  }
}

module.exports = utils;    
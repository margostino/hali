var wolfram = require('wolfram'),
    app_cfg = require('../config/app'),
    Q = require("q");

var client = wolfram.createClient(app_cfg.apiID_wolfram);

var walpha = {
  query: (query, fn) => {
    client.query(query, fn);
  },
  response: (error, result) => {
    var deferred = Q.defer();
    var response = '';
    if (error) deferred.reject(err);
    result.forEach(function(entry) {
        var title = entry.title;
        var subpods = entry.subpods;
        if(title.indexOf('Input')==-1 && title.indexOf('Image')==-1 && title.indexOf('Wikipedia')==-1){
          if (!(subpods[0].title=="" && subpods[0].value=="")){
            response += "::" + title + "::";
            subpods.forEach(function(entry) {
              var result = "";
              if(entry.title)
                result = entry.title + ": " + entry.value;
              else
                result = entry.value;
              response += result;
            });
          }
        }
    });    
    deferred.resolve(response);
    return deferred.promise;
  }
}

module.exports = walpha;

var wolfram = require('wolfram'),
    app_cfg = require('../config/app'),
    entity_cfg = require('../config/entity'),
    Q = require("q");

var client = wolfram.createClient(app_cfg.apiID_wolfram);

function validTitle(title){
  if(title.indexOf('Input')==-1 &&
    title.indexOf('Image')==-1 &&
    title.indexOf('Wikipedia')==-1)
      return true;
  else
    return false;
}

function validSubpods(subpods){
  if (!(subpods[0].title=="" && subpods[0].value==""))
    return true;
  else
    return false;
}

function isResultImage(subpods){
  if (subpods[0].title=="" && subpods[0].value=="" && subpods[0].image!="")
    return true;
  else
    return false;
}

var walpha = {
  query: (query, fn) => {
    client.query(query, fn);
  },
  response: (error, result) => {
    //console.log(JSON.stringify(result));
    var deferred = Q.defer();
    var response = '';
    if (error) deferred.reject(err);

    if(result.length>0){
      result.forEach(function(entry) {
          var title = entry.title;
          var subpods = entry.subpods;
          if(validTitle(title)){
            if (validSubpods(subpods)){

              if(title!='Result')
                response += "::" + title + "::";

              subpods.forEach(function(entry) {
                var result = "";
                if(entry.title)
                  result = entry.title + ": " + entry.value;
                else
                  result = entry.value;
                response += result;
              });
            }else if (isResultImage(subpods)){
              response = subpods[0].image;
            }
          }
      });
    }else {
      response = entity_cfg.WALPHA_REFORM;
    }
    deferred.resolve(response);
    return deferred.promise;
  }
}

module.exports = walpha;

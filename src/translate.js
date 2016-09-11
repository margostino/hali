var request = require('request'),
    Q = require("q");

var translate = {
	get: (text) => {
    var deferred = Q.defer();
    var sourceLang = 'es';
    var targetLang = 'en';
    var text = text.replace('ñ','n');

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
              + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(text);

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var res = body.replace('[[[','');
        res = res.replace(']]]','');
        res = res.replace('"','');
        res = res.replace('"','');
        res = res.split(',')[0];

        deferred.resolve(res);
      }
    })

    return deferred.promise;
  }
}

module.exports = translate;

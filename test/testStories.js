'use strict';
var assert = require('assert'),
    app_cfg = require('../config/app'),
    entity_cfg = require('../config/entity'),
    server = require('../src/server'),
    utils = require('../src/utils'),
    request = require('request'),
    should = require('should'),
    request = require('request'),
    _ = require('underscore'),
    telegram = require('../src/telegram');

var api_url = "http://"+app_cfg.api_host+":"+app_cfg.api_port;

var message = {
  "message_id": 6875,
  "from": {
    "id": 211613276,
    "first_name": "Martín"
  },
  "chat": {
    "id": 211613276,
    "first_name": "Martín",
    "type": "private"
  },
  "date": 1474131076,

}
var contact = {
    "phone_number": "541168184684",
    "first_name": "Martín",
    "user_id": 211613276
};

var wifi_password_api = "joke";

describe('Test stories from Wit.ai', function () {
  before(function(done) {
    message['contact'] = contact;
    server.fn_bot(message)
      .then(function(response){
        var ok = "Bienvenido Martín ¿en que puedo ayudarte?";
        assert.equal(response.text, ok);
        console.log("Verifica API HAS - Wifi call...");
        request(api_url+"/has/wifi", function (error, response, body) {
          if (!error && response.statusCode == 200) {
            wifi_password_api = JSON.parse(body).password;
          }else{
            console.log('API HAS STOPPED!!!')
          }
          done()
        });
      })
      .fail(function(e){
        console.log(e)
        done();
      });
      this.timeout(5000);
      //done();
  });

  this.timeout(20000);

  it('Greeting Story: should return an answer', function(done){
    message['text'] = 'hola';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Hola, que bueno encontrarte por aca. ¿como estás?";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Bye Story: should return an answer', function(done){
    message['text'] = 'chau';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Hasta pronto!";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Greeting How Story: should return an answer', function(done){
    message['text'] = 'como estas?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Estoy muy bien. Gracias!";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Thanks Story: should return an answer', function(done){
    message['text'] = 'gracias';
    server.fn_bot(message)
      .then(function(response){
        var ok = "De nada!";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Wifi Story: should return an answer', function(done){
    message['text'] = 'cual es la contraseña de wifi?';
    server.fn_bot(message)
      .then(function(response){
        assert.equal(response, wifi_password_api);
        done();
      })
      .fail(console.log);
  });

  it('Weather Story: should return an answer', function(done){
    message['text'] = 'como esta el tiempo?';
    server.fn_bot(message)
      .then(function(response){
        assert.notEqual(response.indexOf('Actual'), -1);
        done();
      })
      .fail(console.log);
  });

  it('Info Course Story: should return an answer', function(done){
    message['text'] = 'donde curso hoy?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Cursas IA en aula 518 a las 19hs en Medrano.";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Translate Story: should return an answer', function(done){
    message['text'] = 't:hola';
    server.fn_bot(message)
      .then(function(response){
        var ok = "hello";
        assert.equal(response.toLowerCase(), ok);
        done();
      })
      .fail(console.log);
  });

  it('WAlpha Story: should return an answer', function(done){
    message['text'] = 'w:what is the meaning of life?';
    server.fn_bot(message)
      .then(function(response){
        assert.notEqual(response.indexOf('42'), -1);
        done();
      })
      .fail(console.log);
  });

  it('Broadcast Story: should return an answer', function(done){
    message['text'] = 'b:Hola es un test broadcast';
    server.fn_bot(message)
      .then(function(response){
        assert.notEqual(response.indexOf('Mensaje enviado OK'), -1);
        done();
      })
      .fail(console.log);
  });

  it('Ticket Story: should return an answer', function(done){
    message['text'] = 'm:Hola es un test ticket';
    server.fn_bot(message)
      .then(function(response){
        assert.notEqual(response.indexOf('Ticket enviado OK'), -1);
        done();
      })
      .fail(console.log);
  });

  it('Not Story: should return an answer', function(done){
    message['text'] = 'the cat is under de table';
    server.fn_bot(message)
      .then(function(response){
        assert.notEqual(response.indexOf('Necesito información adicional'), -1);
        done();
      })
      .fail(console.log);
  });

  it('WAlpha Skills Story: should return an answer', function(done){
    message['text'] = 'que puede hacer walpha?';
    server.fn_bot(message)
      .then(function(response){
        var ok = entity_cfg.WALPHA_SKILLS;
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('WAlpha Skills Story: should return an answer', function(done){
    message['text'] = 'que puede hacer walpha?';
    server.fn_bot(message)
      .then(function(response){
        var ok = entity_cfg.WALPHA_SKILLS;
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Datetime Story: should return an answer', function(done){
    message['text'] = 'que dia es hoy?';
    server.fn_bot(message)
      .then(function(response){
        var ok = utils.now();
        assert.equal(response.substring(2,0).trim(), ok.substring(2,0).trim());
        done();
      })
      .fail(console.log);
  });

  it('Hali Languages Story: should return an answer', function(done){
    message['text'] = 'que idiomas sabes hablar?';
    server.fn_bot(message)
      .then(function(response){
        var ok = entity_cfg.HALI_LANGUAGES
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Sex Story: should return an answer', function(done){
    message['text'] = 'sos humana?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Soy un robot pero me siento muy humana.";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Location Story: should return an answer', function(done){
    message['text'] = 'donde estas?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Estoy en un bonito servidor y uso la lectora de living comedor.";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Arq Story: should return an answer', function(done){
    message['text'] = 'cual es tu IP?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "No puedo darte esta información";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali AboutME Story: should return an answer', function(done){
    message['text'] = 'quien sos?';
    server.fn_bot(message)
      .then(function(response){
        var ok = entity_cfg.ABOUT_ME;
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Skills Story: should return an answer', function(done){
    message['text'] = 'que podes hacer?';
    server.fn_bot(message)
      .then(function(response){
        var ok = entity_cfg.HALI_SKILLS;
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Birthday Story: should return an answer', function(done){
    message['text'] = 'cuando es tu cumpleaños?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Nací el 18 de Abril de 2016. Mi peso al nacer fue de tan solo 56kb.";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Colour Story: should return an answer', function(done){
    message['text'] = 'de que color sos?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Azul.";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Hali Years Old Story: should return an answer', function(done){
    message['text'] = 'cuantos años tenes?';
    server.fn_bot(message)
      .then(function(response){
        var ok = "Tengo tan solo unos meses pero me siento pleno como un adolescente";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Insulto Story: should return an answer', function(done){
    message['text'] = 'dale forra!!!!';
    server.fn_bot(message)
      .then(function(response){
        var ok = "No seas mal educado queres!";
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  it('Who User Story: should return an answer', function(done){
    message['text'] = 'sabes quien soy?';
    server.fn_bot(message)
      .then(function(response){
        var ok = 'The Genius';
        assert.equal(response, ok);
        done();
      })
      .fail(console.log);
  });

  /*it('Info Course II: should return an answer', function(done){
    //TODO
  });*/

});

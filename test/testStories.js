'use strict';
var assert = require('assert'),
    app_cfg = require('../config/app'),
    server = require('../src/server'),
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
        request(api_url+"/has/wifi", function (error, response, body) {
          if (!error && response.statusCode == 200) {
            wifi_password_api = JSON.parse(body).password;
          }else{
            console.log('API HAS STOPPED!!!')
          }
          done()
        });
      })
      .fail(console.log);
  });

  this.timeout(8000);

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
        assert.equal(response.indexOf('Actual'), 0);
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
        assert.equal(response.indexOf('::Result::42'), 0);
        done();
      })
      .fail(console.log);
  });
});

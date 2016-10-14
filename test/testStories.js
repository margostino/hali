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
    Q = require("q"),
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

//Function to Assert
function notEqualIndex(value_to_check, value_ok){
    return (value_to_check.indexOf(value_ok)!=-1)
}
function equal(value_to_check, value_ok){
    return (value_to_check == value_ok)
}


//Function for looping Promises results in case that restart server
function loop(promise, fn) {
  return promise.then(fn).then(function (wrapper) {
    return !wrapper.done ? loop(Q(wrapper.value), fn) : wrapper.value;
  });
}

function assertStory(message, response, done, assertFunction){
  loop(server.fn_bot(message), function (response_to_check) {
    console.log("Interacción response: " + response_to_check);
    return {
      done: assertFunction(response_to_check, response),
      value: response
    };
  }).done(function () {
    done();
  });
}

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
    var response = "Hola, que bueno encontrarte por aca. ¿como estás?";
    assertStory(message, response, done, equal);
  });

  it('Bye Story: should return an answer', function(done){
    message['text'] = 'chau';
    var response = "Hasta pronto!";
    assertStory(message, response, done, equal);
  });

  it('Greeting How Story: should return an answer', function(done){
    message['text'] = 'como estas?';
    var response = "Estoy muy bien. Gracias!";
    assertStory(message, response, done, equal);
  });

  it('Thanks Story: should return an answer', function(done){
    message['text'] = 'gracias';
    var reponse = "De nada!";
    assertStory(message, response, done, equal);
  });

  it('Wifi Story: should return an answer', function(done){
    message['text'] = 'cual es la contraseña de wifi?';
    var response = wifi_password_api;
    assertStory(message, response, done, equal);
  });

  it('Weather Story: should return an answer', function(done){
    message['text'] = 'como esta el tiempo?';
    var response = 'Actual';
    assertStory(message, response, done, notEqualIndex);
  });

  it('Info Course Story: should return an answer', function(done){
    message['text'] = 'donde curso hoy?';
    var response = "Cursas IA en aula 518 a las 19hs en Medrano";
    assertStory(message, response, done, equal);
  });

  it('Translate Story: should return an answer', function(done){
    message['text'] = 't:hola';
    var response = 'hello';
    assertStory(message, response.toLowerCase(), done, equal);
  });

  it('WAlpha Story: should return an answer', function(done){
    message['text'] = 'w:what is the meaning of life?';
    var response = '42';
    assertStory(message, response, done, notEqualIndex);
  });

  it('Broadcast Story: should return an answer', function(done){
    message['text'] = 'b:Hola es un test broadcast';
    var response = 'Mensaje enviado OK';
    assertStory(message, response, done, notEqualIndex);
  });

  it('Ticket Story: should return an answer', function(done){
    message['text'] = 'm:Hola es un test ticket';
    var response = 'Ticket enviado OK';
    assertStory(message, response, done, notEqualIndex);
  });

  it('Not Story: should return an answer', function(done){
    message['text'] = 'dklfmnkdlsnfgkldsngklfdsngklvmafn dk';
    var response = 'Necesito información adicional';
    assertStory(message, response, done, notEqualIndex);
  });

  it('WAlpha Skills Story: should return an answer', function(done){
    message['text'] = 'que puede hacer walpha?';
    var response = entity_cfg.WALPHA_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('WAlpha Skills Story: should return an answer', function(done){
    message['text'] = 'que puede hacer walpha?';
    var response = entity_cfg.WALPHA_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('Datetime Story: should return an answer', function(done){
    message['text'] = 'que dia es hoy?';
    var response = utils.now().substring(2,0).trim();
    var assertFunction = function(value_to_check, response){
      return (value_to_check.substring(2,0).trim()==response);
    }
    assertStory(message, response, done, assertFunction);
  });

  it('Hali Languages Story: should return an answer', function(done){
    message['text'] = 'que idiomas sabes hablar?';
    var reponse = entity_cfg.HALI_LANGUAGES;
    assertStory(message, response, done, equal);
  });

  it('Hali Sex Story: should return an answer', function(done){
    message['text'] = 'sos humana?';
    var reponse = "Soy un robot pero me siento muy humana.";
    assertStory(message, response, done, equal);
  });

  it('Hali Location Story: should return an answer', function(done){
    message['text'] = 'donde estas?';
    var reponse = "Estoy en un bonito servidor y uso la lectora de living comedor.";
    assertStory(message, response, done, equal);
  });

  it('Hali Arq Story: should return an answer', function(done){
    message['text'] = 'cual es tu IP?';
    var reponse = "No puedo darte esta información";
    assertStory(message, response, done, equal);
  });

  it('Hali AboutME Story: should return an answer', function(done){
    message['text'] = 'quien sos?';
    var reponse = entity_cfg.ABOUT_ME;
    assertStory(message, response, done, equal);
  });

  it('Hali Skills Story: should return an answer', function(done){
    message['text'] = 'que podes hacer?';
    var reponse = entity_cfg.HALI_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('Hali Birthday Story: should return an answer', function(done){
    message['text'] = 'cuando es tu cumpleaños?';
    var reponse = "Nací el 18 de Abril de 2016. Mi peso al nacer fue de tan solo 56kb.";
    assertStory(message, response, done, equal);
  });

  it('Hali Colour Story: should return an answer', function(done){
    message['text'] = 'de que color sos?';
    var reponse = "Azul.";
    assertStory(message, response, done, equal);
  });

  it('Hali Years Old Story: should return an answer', function(done){
    message['text'] = 'cuantos años tenes?';
    var reponse = "Tengo tan solo unos meses pero me siento pleno como un adolescente";
    assertStory(message, response, done, equal);
  });

  it('Insulto Story: should return an answer', function(done){
    message['text'] = 'esta es una puta prueba';
    var reponse = "No seas mal educado queres!";
    assertStory(message, response, done, equal);
  });

  it('Who User Story: should return an answer', function(done){
    message['text'] = 'sabes quien soy?';
    var response = 'The Genius';
    assertStory(message, response, done, equal);
  });

  it('Book Availability Story: should return an answer', function(done){
    message['text'] = 'esta disponible el libro de Silberschatz?';
    var response = 'El libro esta disponible';
    assertStory(message, response, done, equal);
  });

  it('Book Advice Story: should return an answer', function(done){
    message['text'] = 'que libro me recomendas para Sistemas Operativos??';
    var response = 'Los libros disponibles: William Stallings 5ta Edición, Abraham Silberschatz.';
    assertStory(message, response, done, equal);
  });

  it('Info Department Story: should return an answer', function(done){
    message['text'] = 'donde el departamento de sistemas';
    var response = "Tu departamento esta en Medrano, oficina 318 (piso 3)";
    assertStory(message, response, done, equal);
  });

  it('Info Department Story (with ask): should return an answer', function(done){
    message['text'] = 'donde esta mi departamento?';
    var response = "¿especialidad/carrera?";
    assertStory(message, response, done, equal);
    message['text'] = 'sistemas';
    response = "Tu departamento esta en Medrano, oficina 318 (piso 3)";
    assertStory(message, response, done, equal);
  });

  it('Info Course Story (with ask): should return an answer', function(done){
    message['text'] = 'donde curso?';
    var response = "¿cuando?";
    assertStory(message, response, done, equal);
    message['text'] = 'hoy';
    response = "¿cuando?";
    assertStory(message, response, done, equal);
  });

});

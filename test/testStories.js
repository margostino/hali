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
var TIMEOUT_BT_FLOW = 10000;
var TIMEOUT_BEFORE = 10000;
var TIMEOUT_TESTS_MAIN = 20000;

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
function equalIndex(value_to_check, value_ok){
    console.log('ASSERT-EQUALINDEX: ' + (value_to_check.indexOf(value_ok)!=-1));
    assert(value_to_check.indexOf(value_ok)!=-1);
}

function equal(value_to_check, value_ok){
    console.log('ASSERT-EQUAL: ' + (value_to_check == value_ok));
    assert(value_to_check == value_ok)
}

//Function for looping Promises results in case that restart server
function loop(promise, iteration, fn) {
  return promise.then(fn).then(function (wrapper) {
    return !wrapper.done ?
      loop(server.fn_bot(wrapper.value), wrapper.iteration, fn) : wrapper.value;
  });
}

function assertStory(message, response, done, assertFunction){
  var iteration = 0;
  loop(server.fn_bot(message), iteration, function (response_to_check) {
    if(response_to_check)
      response_to_check = response_to_check.toLowerCase();

    response = response.toLowerCase();
    console.log("Response interaction to check: " + response_to_check);
    console.log("Valid interaction Response: " + response);
    console.log("Valid interaction #" + iteration);
    if(response_to_check){
      assertFunction(response_to_check, response);
    }
    return {
        done: response_to_check,
        iteration: iteration++,
        value: message
      };
  }).done(function () {
    if(done) done();
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
      this.timeout(TIMEOUT_BEFORE);
      //done();
  });

  this.timeout(TIMEOUT_TESTS_MAIN);

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
    var response = "De nada!";
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
    assertStory(message, response, done, equalIndex);
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
    assertStory(message, response, done, equalIndex);
  });

  it('Broadcast Story: should return an answer', function(done){
    message['text'] = 'b:Hola es un test broadcast';
    var response = 'Mensaje enviado OK';
    assertStory(message, response, done, equalIndex);
  });

  it('Ticket Story: should return an answer', function(done){
    message['text'] = 'm:Hola es un test ticket';
    var response = 'Ticket enviado OK';
    assertStory(message, response, done, equalIndex);
  });

  it('Not Story: should return an answer', function(done){
    message['text'] = 'dklfmnkdlsnfgkldsngklfdsngklvmafn dk';
    var response = 'Necesito información adicional';
    assertStory(message, response, done, equalIndex);
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
    var response = entity_cfg.HALI_LANGUAGES;
    assertStory(message, response, done, equal);
  });

  it('Hali Sex Story: should return an answer', function(done){
    message['text'] = 'sos humana?';
    var response = "Soy un robot pero me siento muy humana.";
    assertStory(message, response, done, equal);
  });

  it('Hali Location Story: should return an answer', function(done){
    message['text'] = 'donde estas?';
    var response = "Estoy en un bonito servidor y uso la lectora de living comedor.";
    assertStory(message, response, done, equal);
  });

  it('Hali Arq Story: should return an answer', function(done){
    message['text'] = 'cual es tu IP?';
    var response = "No puedo darte esta información";
    assertStory(message, response, done, equal);
  });

  it('Hali AboutME Story: should return an answer', function(done){
    message['text'] = 'quien sos?';
    var response = entity_cfg.ABOUT_ME;
    assertStory(message, response, done, equal);
  });

  it('Hali Skills Story: should return an answer', function(done){
    message['text'] = 'que podes hacer?';
    var response = entity_cfg.HALI_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('Translator Skills Story: should return an answer', function(done){
    message['text'] = 'ayudame traductor';
    var response = entity_cfg.TRANSLATOR_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('Broadcast Skills Story: should return an answer', function(done){
    message['text'] = 'ayudame mensajeria';
    var response = entity_cfg.BROADCAST_SKILLS;
    assertStory(message, response, done, equal);
  });

  it('Hali Birthday Story: should return an answer', function(done){
    message['text'] = 'cuando es tu cumpleaños?';
    var response = "Nací el 18 de Abril de 2016. Mi peso al nacer fue de tan solo 56kb.";
    assertStory(message, response, done, equal);
  });

  it('Hali Colour Story: should return an answer', function(done){
    message['text'] = 'de que color sos?';
    var response = "Azul.";
    assertStory(message, response, done, equal);
  });

  it('Hali Years Old Story: should return an answer', function(done){
    message['text'] = 'cuantos años tenes?';
    var response = "Tengo tan solo unos meses pero me siento pleno como un adolescente";
    assertStory(message, response, done, equal);
  });

  it('Insulto Story: should return an answer', function(done){
    message['text'] = 'esta es una puta prueba';
    var response = "No seas mal educado queres!";
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

  it('Info Department Story with ask: should return an answer', function(done){
    message['text'] = 'donde esta mi departamento?';
    var response = "¿especialidad/carrera?";
    assertStory(message, response, null, equal);
    setTimeout(function(){
      message['text'] = 'sistemas';
      response = "Tu departamento esta en Medrano, oficina 318 (piso 3)";
      assertStory(message, response, done, equal);
    },TIMEOUT_BT_FLOW);
  });

  it('Info Course Story with ask: should return an answer', function(done){
    message['text'] = 'donde curso?';
    var response = "¿cuando?";
    assertStory(message, response, null, equal);
    setTimeout(function(){
      message['text'] = 'hoy';
      response = "Cursas IA en aula 518 a las 19hs en Medrano";
      assertStory(message, response, done, equal)
    },TIMEOUT_BT_FLOW);
  });

  it('Multiple retry with Translate Story', function(done){
    message['text'] = 'quien fue el ganador del ganador del Mundial de 2014?';
    var response = "Germany";
    assertStory(message, response, done, equalIndex);
  });

  it('Room Magna availability Story', function(done){
    message['text'] = 'esta disponible el aula magna?';
    var response = "El aula esta disponible!";
    assertStory(message, response, done, equal);
  });

  it('Room Audiovisual availability Story', function(done){
    message['text'] = 'esta disponible el aula Audiovisual?';
    var response = "El aula esta disponible!";
    assertStory(message, response, done, equal);
  });

  it('Contact/Phone of Medrano University Story', function(done){
    message['text'] = 'cual es el telefono de Medrano?';
    var response = "4867-7500";
    assertStory(message, response, done, equalIndex);
  });

  it('Contact/Phone of Campus University Story', function(done){
    message['text'] = 'cual es el telefono de Campus?';
    var response = "4867-7500";
    assertStory(message, response, done, equalIndex);
  });

  it('Calendar 2016 Story', function(done){
    message['text'] = 'calendario de este año?';
    var response = "Académico";
    assertStory(message, response, done, equalIndex);
  });

  it('Beginners 2017 Story', function(done){
    message['text'] = 'como es el proceso de ingresantes?';
    var response = "ya se encuentra publicada";
    assertStory(message, response, done, equalIndex);
  });

  it('Special Exams Story', function(done){
    message['text'] = 'como son las mesas especiales?';
    var response = "Solo se inscriben los alumnos que abren mesa";
    assertStory(message, response, done, equalIndex);
  });

  it('Exceptions Story', function(done){
    message['text'] = 'como puedo pedir una excepción de correlativas';
    var response = "EXCEPCION DE CORRELATIVAS";
    assertStory(message, response, done, equalIndex);
  });

});

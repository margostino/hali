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

  /** Rutina DEMO **/
  it('DEMO Wifi Stories: should works PERFECT!!!', function(done){
    message['text'] = 'cual es la contraseña de wifi?';
    var response = wifi_password_api;
    assertStory(message, response, done, equal);
  });

  it('DEMO Next Exams Stories: should works PERFECT!!!', function(done){
    message['text'] = 'cuando son los próximos finales?';
    var response = "Del 1 al 28 de Diciembre";
    assertStory(message, response, done, equal);
  });

  it('DEMO Book Availability Stories: should works PERFECT!!!', function(done){
    message['text'] = 'esta disponible el libro de Silberschatz?';
    var response = 'El libro esta disponible';
    assertStory(message, response, done, equal);
  });

  it('DEMO Book Recommendation Stories: should works PERFECT!!!', function(done){
    message['text'] = 'que libro me recomendas para Inteligencia Artificial??';
    var response = 'Te recomiendo Ingeniería de Sistemas Expertos';
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Department Stories: should works PERFECT!!!', function(done){
    message['text'] = 'donde el departamento de sistemas?';
    var response = 'Tu departamento esta en Medrano, oficina 318 (piso 3)';
    assertStory(message, response, done, equal);
  });

  it('DEMO Where Course Stories: should works PERFECT!!!', function(done){
    message['text'] = 'donde curso?';
    var response = "¿cuando?";
    assertStory(message, response, null, equal);
    setTimeout(function(){
      message['text'] = 'hoy';
      response = "Cursas IA en aula 518 a las 19hs en Medrano";
      assertStory(message, response, done, equal)
    },TIMEOUT_BT_FLOW);
  });

  it('DEMO Room Availability Stories: should works PERFECT!!!', function(done){
    message['text'] = 'esta disponible el aula magna?';
    var response = "El aula esta disponible!";
    assertStory(message, response, done, equal);
  });

  it('DEMO Phone/Contact Medrano Stories: should works PERFECT!!!', function(done){
    message['text'] = 'cual es el telefono de Medrano?';
    var response = "4867-7500";
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Calendar Stories: should works PERFECT!!!', function(done){
    message['text'] = 'me mostras el calendario academico de este año?';
    var response = "Académico";
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Special Exams Stories: should works PERFECT!!!', function(done){
    message['text'] = 'como son las mesas especiales?';
    var response = "Solo se inscriben los alumnos que abren mesa";
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Exception Courses Stories: should works PERFECT!!!', function(done){
    message['text'] = 'como puedo pedir una excepción de correlativas?';
    var response = "Formulario completo";
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Start Uni Stories: should works PERFECT!!!', function(done){
    message['text'] = 'como se ingresa a la facu?';
    var response = "INGRESO 2017";
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Weather Stories: should works PERFECT!!!', function(done){
    message['text'] = 'como esta el tiempo?';
    var response = 'Actual';
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Day Stories: should works PERFECT!!!', function(done){
    message['text'] = 'que dia es hoy?';
    var response = utils.now().substring(2,0).trim();
    var assertFunction = function(value_to_check, response){
      return (value_to_check.substring(2,0).trim()==response);
    }
    assertStory(message, response, done, assertFunction);
  });

  it('DEMO Translator Stories: should works PERFECT!!!', function(done){
    message['text'] = 't: cuales son los algoritmos más eficientes de inteligencia artificial?';
    var response = 'What are the most efficient artificial intelligence algorithms?';
    assertStory(message, response.toLowerCase(), done, equal);
  });

  it('DEMO Broadcast Stories: should works PERFECT!!!', function(done){
    message['text'] = 'b: hoy no hay clases por estado gripal del profe';
    var response = 'Mensaje enviado OK';
    assertStory(message, response, done, equalIndex);
  });

  it('DEMO Ticket Stories: should works PERFECT!!!', function(done){
    message['text'] = 'm: necesito instalar en las maquinas del Laborario Rojo el software packet tracer de Cisco';
    var response = 'Ticket enviado OK';
    assertStory(message, response, done, equalIndex);
  });

});

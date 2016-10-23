var Q = require("q"),
    request = require('request'),
    app_cfg = require('../config/app'),
    entity_cfg = require('../config/entity'),
    telegram = require('./telegram'),
    translate = require('./translate'),
    walpha = require('../src/walpha'),
    utils = require('./utils'),
    _ = require('underscore'),
    multiline = require('multiline');

var api_url = "http://"+app_cfg.api_host+":"+app_cfg.api_port;

const actions = {
  ping_story: (id) => {
    response = entity_cfg.PONG;
    return Q(response);
  },
  not_story: (id) => {
    response = entity_cfg.NOT_STORY;
    return Q(response);
  },
  greeting: (id) => {
    response = "Hola, que bueno encontrarte por aca. ¿como estás?";
    return Q(response);
  },
  bye: (id) => {
    response = "Hasta pronto!";
    return Q(response);
  },
  greeting_how: (id) => {
    response = "Estoy muy bien. Gracias!";
    return Q(response);
  },
  weather: (id) =>{
    var deferred = Q.defer();
    utils.getWeather(function(response){
      deferred.resolve(response);
    });
    return deferred.promise;
  },
  thanks: (id) =>{
    response = "De nada!";
    return Q(response);
  },
  info_course: (id) =>{
    response = "Cursas IA en aula 518 a las 19hs en Medrano";
    return Q(response);
  },
  where_course: (id) =>{
    response = "¿cuando?";
    return Q(response);
  },
  insulto: (id) =>{
    response = "No seas mal educado queres!";
    return Q(response);
  },
  hali_years_old: (id) =>{
    response = "Tengo tan solo unos meses pero me siento pleno como un adolescente";
    return Q(response);
  },
  hali_colour: (id) =>{
    response = "Azul.";
    return Q(response);
  },
  hali_birthday: (id) =>{
    response = "Nací el 18 de Abril de 2016. Mi peso al nacer fue de tan solo 56kb.";
    return Q(response);
  },
  hali_skills: (id) =>{
    response = entity_cfg.HALI_SKILLS;
    return Q(response);
  },
  hali_who: (id) =>{
    response = entity_cfg.ABOUT_ME;
    return Q(response);
  },
  hali_arq: (id) =>{
    response = "No puedo darte esta información";
    return Q(response);
  },
  hali_location: (id) =>{
    response = "Estoy en un bonito servidor y uso la lectora de living comedor.";
    return Q(response);
  },
  hali_sex: (id) =>{
    response = "Soy un robot pero me siento muy humana.";
    return Q(response);
  },
  hali_languages: (id) =>{
    response = entity_cfg.HALI_LANGUAGES;
    return Q(response);
  },
  datetime: (id) =>{
    response = utils.now();
    return Q(response);
  },
  who_user: (id) =>{
    response = 'The Genius'; //TODO: api request con ID
    return Q(response);
  },
  walpha_skills: (id) =>{
    response = entity_cfg.WALPHA_SKILLS;
    return Q(response);
  },
  info_wifi: (id) =>{
    var deferred = Q.defer();
    request(api_url+"/has/wifi", function (error, response, body) {
      console.log(error);
      if (!error && response.statusCode == 200) {
        response = JSON.parse(body).password;
      }else{
        response = entity_cfg.API_ERROR
      }
      deferred.resolve(response);
    });
    return deferred.promise;
  },
  info_department: (id) =>{
    response = "Tu departamento esta en Medrano, oficina 318 (piso 3)";
    return Q(response);
  },
  what_career: (id) =>{
    response = "¿especialidad/carrera?";
    return Q(response);
  },
  ticket: (id, message) => {
      var deferred = Q.defer();
      var ticket_data = {
        "user": "legajoTIPO1110009",
        "subject": "Pedido de mantenimiento",
        "location": "Medrano",
        "description": message
      }
      console.log('Envia a la API el ticket...');
      request.post({
          json: true,
          body: ticket_data,
          url: api_url + "/has/tickets"
          }, function(error, response, body) {
        		if(error) {
        			deferred.reject('<ALUMNO> No pudo preguntar: ' + error);
              console.log("Error al enviar el ticket")
        		} else {
              var message_status = "Ticket enviado OK.";
              deferred.resolve(message_status);
        		}
  	  });
      return deferred.promise;
  },
  broadcast: (id, message) => {
    var name = '';
    var to_users = _.filter(app_cfg.users, function(e){return e.id!=id})
    //var to_users = app_cfg.users;
    var msg = message;
    if(name){
      msg = "El usuario " + name + " te envia el siguiente mensaje: ";
      msg += message;
    }
    telegram.sendBroadcast(to_users, msg, telegram.opts)
    var message_status = "Mensaje enviado OK. Remitente: " + name;
    message_status += ". Destinatarios: " + JSON.stringify(to_users);
    return Q(message_status);
  },
  walpha: (id, message) => {
    var deferred = Q.defer();
    walpha.query(message, function (err, result) {
      walpha.response(err, result)
        .then(function(response){
          deferred.resolve(response);
        })
    });
    return deferred.promise;
  },
  translate: (id, message) =>{
    var deferred = Q.defer();
    //Es flujo traductor
    translate.get(message)
        .then(function(response){
          deferred.resolve(response);
        })
        .fail(function(error){
          response = "No puedo traducir eso. Reformula por favor!";
          deferred.resolve(response);
        });

    return deferred.promise;
  },
  book_info: (id) =>{
    response = "El libro esta disponible";
    return Q(response);
  },
  book_availability: (id) =>{
    response = "El libro esta disponible";
    return Q(response);
  },
  book_advice: (id) =>{
    response = "Los libros disponibles: William Stallings 5ta Edición, Abraham Silberschatz.";
    return Q(response);
  },
  room_availability: (id) =>{
    response = "El aula esta disponible!";
    return Q(response);
  },
  location_university: (id) =>{
    response = multiline(function(){/*
Dirección Sede Medrano: Medrano 951. (C1179AAQ) Ciudad Autónoma de Buenos Aires
Dirección: Mozart 2300. Ciudad Autónoma de Buenos Aires
    */})
    return Q(response);
  },
  contact_university: (id) =>{
    response = multiline(function(){/*
Teléfono: (011) 4867-7500
Sitio Web http://www.frba.utn.edu.ar/
E-Mail decanato@frba.utn.edu.ar
    */})
    return Q(response);
  },
  calendar: (id) =>{
    var url_calendar = "http://siga.frba.utn.edu.ar/up/docs/CalendarioAcademico2016.jpg";
    telegram.sendPhoto(id, url_calendar)
    response = "Calendario Académico 2016";//TODO: facilitar alternativas de recurso enviado por telegram
    return Q(response);
  },
  beginners_process: (id) =>{
    var response = multiline(function(){/*
INGRESO 2017
La inscripción para el Ingreso 2017 ya se encuentra publicada.
Para conocer el Seminario Universitario (requisito para ingresar a la Facultad) te sugiero leer las premisas básicas.
En el siguiente instructivo encontrarás también en forma detalla las etapas de la inscripción para el Ingreso 2017

En los meses de Septiembre y Octubre de 2016 se desarrollaran charlas informativas sobre las carreras.
También en el menu principal están publicados los programas de las materias de Ingreso.
Cualquier consulta podes escribir a ingreso@siga.frba.utn.edu.ar
    */})
    return Q(response);
  },
  academica_special_exams: (id) =>{
    var response = multiline(function(){/*
Nuevo procedimiento para los alumnos de Ing Química e Ing. Industrial
Solo se inscriben los alumnos que abren mesa (Alumnos que ya firmaron todas las materias de su plan de estudios y solo adeudan finales).
Fechas de Inscripción del 7 al 12 de Octubre

Los alumnos que desean acoplarse a las mesas especiales se inscribirán de la siguiente manera :
Alumnos de Ing Química del 19 al 24 de Octubre.
Alumnos de Ing Industrial del 14 al 18 de Octubre.
Las Inscripciones para los alumnos que desean acoplarse a los finales se realizará unicamente por la web del Siga desde Inscripción a finales.
    */})
    return Q(response);
  },
  academica_exceptions: (id) =>{
    var response = multiline(function(){/*
EXCEPCION DE CORRELATIVAS TODAS LAS ESPECIALIDADES DESDE EL 01/08/2016 al 12/08/2016
Formulario completo
Fotocopias de las hoja de los datos personales de la Libreta Universitaria
Historial Consolidado (El alumno debe verificar que el historial se encuentre completo, de lo contrario deberá indicar los datos faltantes y adjuntar fotocopias de las hojas de su libreta que acrediten la información omitida.)
    */})
    return Q(response);
  }
};

module.exports = actions;

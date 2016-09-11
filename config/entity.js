var multiline = require('multiline');

var entity = {
	ABOUT_ME: multiline(function(){/*
Mi nombre es Hali!, la primer asistente de la UTN para personas de la UTN.
HALI proviene de Harry pero dicho por un Oriental. :) jaja.
Fui contruida por el Grupo de Proyecto Final G501 en el año 2016.
Mi mision es ayudarte en tu carrera en todo lo que este a mi alcance.
Para esto seria genial conocernos, y aprender mutuamente.
Cuanto más cuentes conmigo más voy a mejorar y aprender.
Muchas Gracias, y espero que esta relacion sea muy productiva para ambos.
Por cierto venis muy bien en la carrera! Vamos por más. :)

Me encuentro en estado de entrenamiento. En breve ya voy a ser más inteligente! :)
Cuando te recibas vamos a tomar unas cervezas!!!
	*/}),
	NOT_WORKED: multiline(function(){/*
No llego el mensaje. ¿podrías repetirlo?		
	*/}),
	SKILLS: multiline(function(){/*
De momento estoy preparada para lo siguiente:
1) Contarte si el aula Magna esta disponible o no.
2) Contarte acerca de mi, mi historia.
3) Contarte donde esta tu departamento.
4) Saludarte.

Dia a dia voy agregando nuevos skills.
Arriba esas palmas!! Clap clap!
	*/}),
	BROADCAST_CONFUSE: multiline(function(){/*
Me estas confundiendo. Si queres enviar un mensaje a los alumnos, enviame:
Ejemplo:
Mensaje: "la facultad va a estar cerrada hoy"
	*/}),
	CONFUSE: multiline(function(){/*
Me estas confundiendo. Pregunta concreta. ¿En que puedo ayudarte?
	*/}),
	NOT_STORY: multiline(function(){/*
¿En que puedo ayudarte?
Algunas preguntas o comentarios no los entiendo todavía.
Necesito información adicional para entenderte.
Proba preguntandome de otras formas, quizas comprenda.
	*/}),
	START: multiline(function(){/*
Hola!!!. Necesito que comprobar tu identidad.
Autenticate presionando el comando de abajo porfa :)
	*/}),
	TESTME: multiline(function(){/*
Hola crack!!, Ya estoy online de nuevo con algo más de entrenamiento.
Cuando tengas tiempo libre testeame.
Y si funciono mal no te quejes que estamos trabajando.
Abrazo.
	*/}),
	ASK_START: multiline(function(){/*
Hola. Aún no estas autenticado.
Por favor identificate presionando el boton de abajo.
	*/}),
	LOCATIONS: multiline(function(){/*
		Medrano 951 (C1179AAQ) C.A.B.A - Tel: (54 11) 4867-7500.
		Campus: Mozart 2300 (C1407IVT) C.A.B.A. - Tel: (54 11) 4867-7500.
	*/}),

	GOOGLE_IT: "https://www.google.com.ar/#q=",
	STOP: 'Hasta pronto!'
};

module.exports = entity;

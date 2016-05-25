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

	SKILLS: multiline(function(){/*
		De momento estoy preparada para lo siguiente:
		1) Contarte si el aula Magna esta disponible o no.
		2) Contarte acerca de mi, mi historia.
		3) Contarte donde esta tu departamento.
		4) Saludarte.

		Dia a dia voy a gregando nuevos skills.
		Arriba esas palmas!! Clap clap!
	*/}),

	NOT_STORY: multiline(function(){/*
		Historia no entrenada. 
		Algunas preguntas o comentarios no los entiendo todavia, o quizas si,
		pero esta fuera de contexto y necesito información adicional para entenderte.
		Verifica que tu consulta se encuentre dentro del contexto correcto.
		Ejemplo: Decime "¿Está disponible el aula Hola cómo estás?", no tiene ningún sentido. 
	*/}),

	TESTME: multiline(function(){/*
		Hola crack!!, Ya estoy online de nuevo con algo más de entrenamiento.
		Cuando tengas tiempo libre testeame. 
		Y si funciono mal no te quejes que estamos arrancando.
		Abrazo.
	*/}),

	GOOGLE_IT: "https://www.google.com.ar/#q=",
	START: 'Bienvenido!',
	STOP: 'Hasta pronto!'
};

module.exports = entity;
